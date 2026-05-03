"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DocumentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const analysis_service_1 = require("../analysis/analysis.service");
const client_1 = require("@prisma/client");
const storage_service_1 = require("../common/storage.service");
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
let DocumentsService = DocumentsService_1 = class DocumentsService {
    prisma;
    analysisService;
    storageService;
    logger = new common_1.Logger(DocumentsService_1.name);
    constructor(prisma, analysisService, storageService) {
        this.prisma = prisma;
        this.analysisService = analysisService;
        this.storageService = storageService;
    }
    async uploadAndProcess(file, providedUserId) {
        if (!file || file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('Only PDF files are supported currently.');
        }
        if (!providedUserId) {
            throw new common_1.BadRequestException('User ID is required from the authentication token.');
        }
        const userId = providedUserId;
        const fileExtension = path.extname(file.originalname);
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const fileUrl = await this.storageService.uploadFile(file.buffer, fileName, file.mimetype);
        const document = await this.prisma.document.create({
            data: {
                userId,
                originalFileName: file.originalname,
                fileUrl,
                status: client_1.DocumentStatus.PENDING,
            },
        });
        this.analysisService.analyzeDocument(document.id, file.buffer).catch((err) => {
            this.logger.error(`Analysis failed for document ${document.id}:`, err);
        });
        return {
            message: 'Document uploaded successfully and is being analyzed',
            documentId: document.id,
            status: document.status,
        };
    }
    async getDocumentReport(documentId) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: {
                report: {
                    include: {
                        clauses: true,
                    },
                },
            },
        });
        if (!document) {
            throw new common_1.BadRequestException('Document not found');
        }
        return document;
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = DocumentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analysis_service_1.AnalysisService,
        storage_service_1.StorageService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map