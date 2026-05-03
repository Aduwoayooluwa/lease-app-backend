import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadFile(file: Express.Multer.File, body: UploadDocumentDto, user: any): Promise<{
        message: string;
        documentId: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
    }>;
    getReport(id: string): Promise<{
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
