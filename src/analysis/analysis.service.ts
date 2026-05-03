import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DocumentStatus, ClauseType, SeverityLevel } from '@prisma/client';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeDocument(
    documentId: string,
    fileBuffer: Buffer,
    isText = false,
  ): Promise<void> {
    try {
      this.logger.log(`Starting analysis for document: ${documentId}`);
 
      // Update status to ANALYZING
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.ANALYZING },
      });
 
      let textContent: string;
 
      if (isText) {
        textContent = fileBuffer.toString('utf-8');
      } else {
        // Extract text from PDF buffer
        const parser = new PDFParse({ data: fileBuffer });
        const pdfData = await parser.getText();
        textContent = pdfData.text;
        await parser.destroy();
      }
 
      this.logger.log(
        `Extracted ${textContent.length} characters from document ${documentId}`,
      );

      // Ask OpenAI to analyze based on Lagos State Tenancy Law
      const analysisResult = await this.performAIAnalysis(textContent);

      // Save Report
      await this.prisma.analysisReport.create({
        data: {
          documentId,
          overallRiskScore: analysisResult.overallRiskScore,
          summary: analysisResult.summary,
          textContent, // Save the full extracted text here
          clauses: {
            create: analysisResult.clauses.map((c: any) => ({
              clauseType: c.clauseType as ClauseType,
              severity: c.severity as SeverityLevel,
              originalText: c.originalText,
              explanation: c.explanation,
              suggestedChange: c.suggestedChange,
              lawReference: c.lawReference,
            })),
          },
        },
      });

      // Update document status
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.COMPLETED },
      });

      this.logger.log(`Analysis completed for document: ${documentId}`);
    } catch (error) {
      this.logger.error(`Analysis failed for document ${documentId}`, error);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.FAILED },
      });
    }
  }

  private async performAIAnalysis(text: string): Promise<any> {
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

    // Limit text length to prevent token overflow if the PDF is absurdly large.
    // 50,000 chars is roughly 12k tokens, well within GPT-4o limits.
    const safeText = text.substring(0, 50000);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: safeText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Low temperature for more deterministic/legal output
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    return JSON.parse(content);
  }
}
