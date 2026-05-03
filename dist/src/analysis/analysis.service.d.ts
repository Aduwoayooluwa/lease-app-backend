import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class AnalysisService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    private openai;
    constructor(prisma: PrismaService, configService: ConfigService);
    analyzeDocument(documentId: string, fileBuffer: Buffer, isText?: boolean): Promise<void>;
    private performAIAnalysis;
}
