import { PrismaService } from '../prisma/prisma.service';
import { AnalysisService } from '../analysis/analysis.service';
import { StorageService } from '../common/storage.service';
export declare class DocumentsService {
    private readonly prisma;
    private readonly analysisService;
    private readonly storageService;
    private readonly logger;
    constructor(prisma: PrismaService, analysisService: AnalysisService, storageService: StorageService);
    uploadAndProcess(file: Express.Multer.File, providedUserId?: string): Promise<{
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
                clauseType: import("@prisma/client").$Enums.ClauseType;
                severity: import("@prisma/client").$Enums.SeverityLevel;
                originalText: string | null;
                explanation: string;
                suggestedChange: string;
                lawReference: string | null;
                reportId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            overallRiskScore: number;
            summary: string | null;
            documentId: string;
        }) | null;
    } & {
        id: string;
        userId: string;
        originalFileName: string;
        fileUrl: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
