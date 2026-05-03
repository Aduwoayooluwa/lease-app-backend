import { ApiProperty } from '@nestjs/swagger';
import { ClauseType, SeverityLevel, DocumentStatus } from '@prisma/client';

export class ReportClauseDto {
  @ApiProperty({ example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' })
  id: string;

  @ApiProperty({ enum: ClauseType, example: ClauseType.OMISSION })
  clauseType: ClauseType;

  @ApiProperty({ enum: SeverityLevel, example: SeverityLevel.HIGH })
  severity: SeverityLevel;

  @ApiProperty({ required: false, nullable: true, example: null })
  originalText: string | null;

  @ApiProperty({ example: 'The agreement lacks a notice period clause...' })
  explanation: string;

  @ApiProperty({ example: 'Either party wishing to terminate this tenancy...' })
  suggestedChange: string;

  @ApiProperty({ example: 'Lagos State Tenancy Law 2011' })
  lawReference: string;
}

export class AnalysisReportDto {
  @ApiProperty({ example: 'c451b682-8b43-4e89-a297-c75c029665bc' })
  id: string;

  @ApiProperty({ example: 85 })
  overallRiskScore: number;

  @ApiProperty({
    example: 'This lease is highly predatory due to omitted notice periods.',
  })
  summary: string;

  @ApiProperty({ type: [ReportClauseDto] })
  clauses: ReportClauseDto[];
}

export class DocumentReportResponseDto {
  @ApiProperty({ example: 'e451b682-8b43-4e89-a297-c75c029665bc' })
  id: string;

  @ApiProperty({ enum: DocumentStatus, example: DocumentStatus.COMPLETED })
  status: DocumentStatus;

  @ApiProperty({ type: AnalysisReportDto, required: false })
  report: AnalysisReportDto;
}
