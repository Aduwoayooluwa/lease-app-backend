import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private configService;
    private s3;
    private readonly logger;
    constructor(configService: ConfigService);
    uploadFile(buffer: Buffer, fileName: string, mimetype: string): Promise<string>;
}
