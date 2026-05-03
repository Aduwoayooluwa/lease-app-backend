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

  async uploadAndProcess(file: Express.Multer.File, providedUserId?: string) {
    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are supported currently.');
    }

    if (!providedUserId) {
      throw new BadRequestException('User ID is required from the authentication token.');
    }
    const userId = providedUserId;

    // Save file to Cloudflare R2
    const fileExtension = path.extname(file.originalname);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;
    const fileUrl = await this.storageService.uploadFile(file.buffer, fileName, file.mimetype);

    // Create DB Record
    const document = await this.prisma.document.create({
      data: {
        userId,
        originalFileName: file.originalname,
        fileUrl,
        status: DocumentStatus.PENDING,
      },
    });

    // Trigger analysis asynchronously, passing the buffer directly to save time
    this.analysisService.analyzeDocument(document.id, file.buffer).catch((err) => {
      this.logger.error(`Analysis failed for document ${document.id}:`, err);
    });

    return {
      message: 'Document uploaded successfully and is being analyzed',
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
