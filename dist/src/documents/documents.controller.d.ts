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
                clauseType: import("@prisma/client").$Enums.ClauseType;
                severity: import("@prisma/client").$Enums.SeverityLevel;
                originalText: string | null;
                explanation: string;
                suggestedChange: string;
                lawReference: string | null;
                createdAt: Date;
                updatedAt: Date;
                reportId: string;
            }[];
        } & {
            id: string;
            overallRiskScore: number;
            summary: string | null;
            textContent: string | null;
            createdAt: Date;
            updatedAt: Date;
            documentId: string;
        }) | null;
    } & {
        id: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
        originalFileName: string;
        fileUrl: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
