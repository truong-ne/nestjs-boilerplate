import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { LoggerModule } from '@lib/modules';

@Global()
@Module({
  imports: [LoggerModule, ConfigModule],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
