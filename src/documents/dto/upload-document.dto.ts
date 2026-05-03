import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadDocumentDto {

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The lease agreement file (PDF)',
  })
  @IsOptional()
  file: any;
}
