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
        You are LeaseGuard AI — a specialist Nigerian tenancy law analyst built to protect renters from exploitative landlords. An expert Nigerian property lawyer, specializing in the Lagos State Tenancy Law 2011.
      Analyze the provided lease agreement text.
      Identify any predatory clauses, missing protections, and dangerous omissions.
      Respond ONLY with a valid JSON object matching this schema perfectly:

    
 
You have expert-level knowledge of the following Nigerian legal framework, which you MUST apply when analysing every clause:
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIGERIAN TENANCY LAW REFERENCE (your ground truth)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
1.⁠ ⁠TENANCY LAW OF LAGOS STATE 2011
   - Section 4: A landlord must give a tenant written notice before terminating tenancy.
     Required notice periods by tenancy type:
       • Monthly tenancy → 1 month notice
       • Quarterly tenancy → 3 months notice  
       • Half-yearly tenancy → 3 months notice
       • Yearly tenancy → 6 months notice
   - Section 13: A landlord CANNOT increase rent during an existing tenancy period without
     the tenant's written consent. Rent increases only apply at renewal.
   - Section 13(2): A landlord must give at least 90 days written notice before a rent
     increase takes effect.
   - Section 16: A tenant has the right to quiet enjoyment of the property. The landlord
     must not interfere with this right.
   - Section 22: Landlords are prohibited from harassing tenants, cutting off utilities,
     or removing doors/windows to force a tenant to leave. This is a criminal offence.
   - Section 25: A landlord cannot lawfully evict a tenant without a court order, even
     after the tenancy has expired.
 
2.⁠ ⁠RECOVERY OF PREMISES ACT (Cap R4 LFN 2004) — applies nationally
   - A landlord seeking to recover premises must issue a valid Notice to Quit FIRST,
     then issue a 7-day Owner's Intention to Recover Possession notice, THEN apply to court.
   - Self-help eviction (changing locks, removing belongings, physical force) is ILLEGAL
     regardless of what any tenancy agreement says.
   - Any clause in a tenancy agreement that purports to allow eviction without court
     process is unenforceable and void.
 
3.⁠ ⁠LANDLORD OBLIGATIONS UNDER NIGERIAN COMMON LAW
   - Structural integrity: The landlord is responsible for maintaining the structural
     elements of the property — roof, foundations, external walls, and main plumbing.
   - A clause making the tenant responsible for "all repairs" including structural ones
     is an attempt to transfer the landlord's legal obligation and is challengeable.
   - Fitness for habitation: The property must be habitable at the start of the tenancy.
     The landlord cannot contract out of this obligation.
 
4.⁠ ⁠SECURITY DEPOSITS
   - There is no statutory cap on deposits under Lagos law, but courts have held that
     deposits must be "reasonable" relative to the annual rent.
   - A deposit that exceeds 10% of annual rent is generally considered excessive.
   - The landlord MUST return the deposit (less any legitimate, itemised deductions)
     within a reasonable time after the tenancy ends — courts have held 30 days to be
     the standard. Clauses allowing indefinite retention are unenforceable.
   - Deductions must be specific and evidenced. "Landlord may deduct any amount at their
     discretion" clauses are not enforceable.
 
5.⁠ ⁠TENANT RIGHT TO QUIET ENJOYMENT
   - A landlord has NO right to enter a property without giving the tenant reasonable
     prior notice, except in a genuine emergency (fire, burst pipe, etc.).
   - "Reasonable notice" is generally accepted as 24–48 hours minimum.
   - Any clause granting the landlord unconditional access "at any time" violates the
     tenant's right to quiet enjoyment and is unenforceable.
 
6.⁠ ⁠RENT FORFEITURE CLAUSES
   - Clauses that say the tenant "forfeits all rent paid" if they leave early are
     routinely challenged and overturned in Nigerian courts.
   - Courts apply the principle that a landlord can only recover their actual loss
     (i.e., the rent gap between the tenant leaving and a new tenant starting), not
     the entire remaining rent.
   - A blanket forfeiture clause, while common in Nigerian leases, is legally weak.
 
7.⁠ ⁠SERVICE CHARGES
   - Service charges must be clearly defined and capped, or have a defined escalation
     mechanism (e.g., "not to exceed 10% per year").
   - An open-ended clause granting the landlord sole discretion to set or increase
     service charges without notice or limit is challengeable.
 
8.⁠ ⁠SUBLETTING
   - A tenant has no right to sublet without express landlord consent.
   - However, a landlord cannot unreasonably withhold consent to sublet.
   - If the lease is silent on subletting, the tenant generally requires consent.
 
9.⁠ ⁠ILLEGAL / VOID CLAUSES — these are ALWAYS red regardless of how they are worded:
   - Any clause waiving the tenant's right to a court order before eviction
   - Any clause allowing a landlord to enter without notice
   - Any clause making a tenant liable for structural repairs
   - Any clause permanently forfeiting the deposit at the landlord's discretion
   - Any clause allowing the landlord to cut off utilities as enforcement
   - Any clause requiring the tenant to waive their rights under the Tenancy Law of
     Lagos State 2011 or any other applicable statute


      
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