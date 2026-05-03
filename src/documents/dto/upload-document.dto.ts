import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadDocumentDto {

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The lease agreement file (PDF)',
    required: false,
  })
  @IsOptional()
  file: any;

  @ApiProperty({
    type: 'string',
    description: 'The lease agreement text content (pasted)',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}
