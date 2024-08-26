import { configuration } from '@lib/config/configuration';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './s3.service';
import { LoggerModule } from '../logger';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    LoggerModule,
  ],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
