import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    example: 'Document uploaded successfully and is being analyzed',
  })
  message: string;

  @ApiProperty({ example: 'e451b682-8b43-4e89-a297-c75c029665bc' })
  documentId: string;

  @ApiProperty({ example: 'PENDING' })
  status: string;
}
