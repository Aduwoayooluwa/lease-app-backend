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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
const client_1 = require("@prisma/client");
const pdf_parse_1 = require("pdf-parse");
let AnalysisService = AnalysisService_1 = class AnalysisService {
    prisma;
    configService;
    logger = new common_1.Logger(AnalysisService_1.name);
    openai;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        this.openai = new openai_1.default({ apiKey });
    }
    async analyzeDocument(documentId, fileBuffer, isText = false) {
        try {
            this.logger.log(`Starting analysis for document: ${documentId}`);
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: client_1.DocumentStatus.ANALYZING },
            });
            let textContent;
            if (isText) {
                textContent = fileBuffer.toString('utf-8');
            }
            else {
                const parser = new pdf_parse_1.PDFParse({ data: fileBuffer });
                const pdfData = await parser.getText();
                textContent = pdfData.text;
                await parser.destroy();
            }
            this.logger.log(`Extracted ${textContent.length} characters from document ${documentId}`);
            const analysisResult = await this.performAIAnalysis(textContent);
            await this.prisma.analysisReport.create({
                data: {
                    documentId,
                    overallRiskScore: analysisResult.overallRiskScore,
                    summary: analysisResult.summary,
                    textContent,
                    clauses: {
                        create: analysisResult.clauses.map((c) => ({
                            clauseType: c.clauseType,
                            severity: c.severity,
                            originalText: c.originalText,
                            explanation: c.explanation,
                            suggestedChange: c.suggestedChange,
                            lawReference: c.lawReference,
                        })),
                    },
                },
            });
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: client_1.DocumentStatus.COMPLETED },
            });
            this.logger.log(`Analysis completed for document: ${documentId}`);
        }
        catch (error) {
            this.logger.error(`Analysis failed for document ${documentId}`, error);
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: client_1.DocumentStatus.FAILED },
            });
        }
    }
    async performAIAnalysis(text) {
        const systemPrompt = `
      You are an expert Nigerian property lawyer, specializing in the Lagos State Tenancy Law 2011.
      Analyze the provided lease agreement text.
      Identify any predatory clauses, missing protections, and dangerous omissions.
      Respond ONLY with a valid JSON object matching this schema perfectly:
      {
        "overallRiskScore": <number 0-100, where 100 is highly risky for tenant>,
        "summary": "<string, a 2-3 sentence executive summary of the lease safety>",
        "clauses": [
          {
            "clauseType": "OMISSION" or "EXISTING",
            "severity": "HIGH" or "MEDIUM" or "LOW",
            "originalText": "<string, the EXACT quoted text from the document if EXISTING. If OMISSION, use the string 'Not found in document'>",
            "explanation": "<string, plain English explanation of why this is a risk for the tenant>",
            "suggestedChange": "<string, what exactly to ask the landlord to add/change>",
            "lawReference": "<string, e.g., 'Lagos State Tenancy Law 2011 Section X'>"
          }
        ]
      }
      Ensure all JSON keys match exactly. Do not include markdown \`\`\`json wrappers.
    `;
        const safeText = text.substring(0, 50000);
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: safeText },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
        });
        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error('No content returned from OpenAI');
        }
        return JSON.parse(content);
    }
};
exports.AnalysisService = AnalysisService;
exports.AnalysisService = AnalysisService = AnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AnalysisService);
//# sourceMappingURL=analysis.service.js.map