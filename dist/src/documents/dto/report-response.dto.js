"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentReportResponseDto = exports.AnalysisReportDto = exports.ReportClauseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class ReportClauseDto {
    id;
    clauseType;
    severity;
    originalText;
    explanation;
    suggestedChange;
    lawReference;
}
exports.ReportClauseDto = ReportClauseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' }),
    __metadata("design:type", String)
], ReportClauseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ClauseType, example: client_1.ClauseType.OMISSION }),
    __metadata("design:type", String)
], ReportClauseDto.prototype, "clauseType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.SeverityLevel, example: client_1.SeverityLevel.HIGH }),
    __metadata("design:type", String)
], ReportClauseDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true, example: null }),
    __metadata("design:type", Object)
], ReportClauseDto.prototype, "originalText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'The agreement lacks a notice period clause...' }),
    __metadata("design:type", String)
], ReportClauseDto.prototype, "explanation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Either party wishing to terminate this tenancy...' }),
    __metadata("design:type", String)
], ReportClauseDto.prototype, "suggestedChange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lagos State Tenancy Law 2011' }),
    __metadata("design:type", String)
], ReportClauseDto.prototype, "lawReference", void 0);
class AnalysisReportDto {
    id;
    overallRiskScore;
    summary;
    clauses;
}
exports.AnalysisReportDto = AnalysisReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'c451b682-8b43-4e89-a297-c75c029665bc' }),
    __metadata("design:type", String)
], AnalysisReportDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 85 }),
    __metadata("design:type", Number)
], AnalysisReportDto.prototype, "overallRiskScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'This lease is highly predatory due to omitted notice periods.',
    }),
    __metadata("design:type", String)
], AnalysisReportDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ReportClauseDto] }),
    __metadata("design:type", Array)
], AnalysisReportDto.prototype, "clauses", void 0);
class DocumentReportResponseDto {
    id;
    status;
    report;
}
exports.DocumentReportResponseDto = DocumentReportResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'e451b682-8b43-4e89-a297-c75c029665bc' }),
    __metadata("design:type", String)
], DocumentReportResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.DocumentStatus, example: client_1.DocumentStatus.COMPLETED }),
    __metadata("design:type", String)
], DocumentReportResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AnalysisReportDto, required: false }),
    __metadata("design:type", AnalysisReportDto)
], DocumentReportResponseDto.prototype, "report", void 0);
//# sourceMappingURL=report-response.dto.js.map