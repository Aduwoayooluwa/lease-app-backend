import { ClauseType, SeverityLevel, DocumentStatus } from '@prisma/client';
export declare class ReportClauseDto {
    id: string;
    clauseType: ClauseType;
    severity: SeverityLevel;
    originalText: string | null;
    explanation: string;
    suggestedChange: string;
    lawReference: string;
}
export declare class AnalysisReportDto {
    id: string;
    overallRiskScore: number;
    summary: string;
    textContent: string | null;
    clauses: ReportClauseDto[];
}
export declare class DocumentReportResponseDto {
    id: string;
    status: DocumentStatus;
    report: AnalysisReportDto;
}
