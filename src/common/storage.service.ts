import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID') || '';
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID') || '';
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '';

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(buffer: Buffer, fileName: string, mimetype: string): Promise<string> {
    const bucket = this.configService.get<string>('R2_BUCKET_NAME');
    const publicUrlBase = this.configService.get<string>('R2_PUBLIC_URL');

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: fileName,
          Body: buffer,
          ContentType: mimetype,
        })
      );
      return `${publicUrlBase}/${fileName}`;
    } catch (error) {
      this.logger.error('Failed to upload file to R2', error);
      throw new Error('Failed to upload file to storage');
    }
  }
}
