import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UploadResponseDto } from './dto/upload-response.dto';
import { DocumentReportResponseDto } from './dto/report-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a tenancy agreement for analysis' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Lease Agreement PDF',
    type: UploadDocumentDto,
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded and analysis started',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file format' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadDocumentDto,
    @CurrentUser() user: any,
  ) {
    return this.documentsService.uploadAndProcess(file, user.id);
  }

  @Get(':id/report')
  @ApiOperation({ summary: 'Get the analysis report for a document' })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
    type: DocumentReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getReport(@Param('id') id: string) {
    return this.documentsService.getDocumentReport(id);
  }
}
