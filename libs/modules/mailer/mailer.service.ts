import { MailType } from '@lib/common/enums';
import { IMailConfig } from '@lib/common/interfaces/modules/send-grid';
import { LoggerService } from '@lib/modules';
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailDataRequired, MailService } from '@sendgrid/mail';
@Injectable()
export class MailerService implements OnModuleInit {
  private mailService: MailService;
  private mailConfig: IMailConfig;
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MailerService.name);
  }

  async onModuleInit() {
    this.mailConfig = this.configService.get('mail');
    this.mailService = new MailService();
    this.mailService.setApiKey(this.mailConfig.sendGridKey);
  }

  async sendMail(
    type: MailType,
    templateData: unknown,
    to: string,
    from?: string,
  ): Promise<any> {
    try {
      const templateId = this.mailConfig.template[type];

      const message: MailDataRequired = {
        to,
        from: from || this.mailConfig.mailSender,
        templateId,
        dynamicTemplateData: templateData,
        hideWarnings: true,
      };
      const result = await this.mailService.send(message);

      return result;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
