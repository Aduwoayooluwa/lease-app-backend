import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalysisService } from '../analysis/analysis.service';
import { DocumentStatus } from '@prisma/client';
import { StorageService } from '../common/storage.service';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly analysisService: AnalysisService,
    private readonly storageService: StorageService,
  ) {}

  async uploadAndProcess(
    userId: string,
    file?: Express.Multer.File,
    content?: string,
  ) {
    let finalBuffer: Buffer;
    let fileName: string;
    let mimetype: string;
    let originalName: string;
    let isText = false;

    if (file) {
      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException('Only PDF files are supported currently.');
      }
      finalBuffer = file.buffer;
      originalName = file.originalname;
      mimetype = file.mimetype;
      const fileExtension = path.extname(file.originalname);
      fileName = `${crypto.randomUUID()}${fileExtension}`;
    } else if (content) {
      finalBuffer = Buffer.from(content, 'utf-8');
      originalName = 'pasted-agreement.txt';
      mimetype = 'text/plain';
      fileName = `${crypto.randomUUID()}.txt`;
      isText = true;
    } else {
      throw new BadRequestException('No content provided for analysis.');
    }

    // Save to Cloudflare R2
    const fileUrl = await this.storageService.uploadFile(
      finalBuffer,
      fileName,
      mimetype,
    );

    // Create DB Record
    const document = await this.prisma.document.create({
      data: {
        userId,
        originalFileName: originalName,
        fileUrl,
        status: DocumentStatus.PENDING,
      },
    });

    // Trigger analysis asynchronously
    this.analysisService
      .analyzeDocument(document.id, finalBuffer, isText)
      .catch((err) => {
        this.logger.error(`Analysis failed for document ${document.id}:`, err);
      });

    return {
      message: 'Lease content received successfully and is being analyzed',
      documentId: document.id,
      status: document.status,
    };
  }

  async getDocumentReport(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        report: {
          include: {
            clauses: true,
          },
        },
      },
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    return document;
  }
}
