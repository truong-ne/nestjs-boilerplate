import {
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger';

interface AWSConfig {
  accessKey: string;
  secretKey: string;
  region: string;
  bucket: string;
}

@Injectable()
export class S3Service implements OnModuleInit, OnModuleDestroy {
  private instance: S3Client = null;
  private bucketName: string = 'bucket';

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(S3Service.name);
  }

  onModuleInit() {
    this.createInstance();
  }

  onModuleDestroy() {
    this.instance.destroy();
  }

  createInstance(): S3Client {
    if (this.instance) return this.instance;

    const { accessKey, secretKey, region, bucket } =
      this.configService.get<AWSConfig>('aws');
    const options: S3ClientConfig = {
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    };

    this.instance = new S3Client(options);
    this.bucketName = bucket;

    return this.instance;
  }

  async deleteFiles(fileKeys: string[]): Promise<boolean> {
    try {
      const input: DeleteObjectsCommandInput = {
        Bucket: this.bucketName,
        Delete: {
          Objects: fileKeys.map((file) => ({ Key: file })),
        },
      };

      const command = new DeleteObjectsCommand(input);
      await this.instance.send(command);

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
