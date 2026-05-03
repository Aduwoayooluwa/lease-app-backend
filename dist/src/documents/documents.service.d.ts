import { PrismaService } from '../prisma/prisma.service';
import { AnalysisService } from '../analysis/analysis.service';
import { StorageService } from '../common/storage.service';
export declare class DocumentsService {
    private readonly prisma;
    private readonly analysisService;
    private readonly storageService;
    private readonly logger;
    constructor(prisma: PrismaService, analysisService: AnalysisService, storageService: StorageService);
    uploadAndProcess(userId: string, file?: Express.Multer.File, content?: string): Promise<{
        message: string;
        documentId: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
    }>;
    getDocumentReport(documentId: string): Promise<{
        report: ({
            clauses: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                reportId: string;
                clauseType: import("@prisma/client").$Enums.ClauseType;
                severity: import("@prisma/client").$Enums.SeverityLevel;
                originalText: string | null;
                explanation: string;
                suggestedChange: string;
                lawReference: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            documentId: string;
            overallRiskScore: number;
            summary: string | null;
        }) | null;
    } & {
        id: string;
        originalFileName: string;
        fileUrl: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
