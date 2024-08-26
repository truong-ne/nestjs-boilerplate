import { defaultLang } from '@lib/common';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { validationErr } from './i18n';

const getStatusCode = <T>(exception: T): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

const getErrorMessage = <T>(exception: T): Array<T> | T => {
  const errInstance =
    exception instanceof HttpException
      ? exception['response']['message']
      : exception;

  try {
    return 'message' in errInstance ? errInstance['message'] : errInstance;
  } catch {
    return errInstance;
  }
};

const translateError = <T>(error: T | T[], language: string): T | T[] => {
  if (error instanceof Array) {
    const listErr = error.pop();

    return Object.entries(listErr).reduce((prev, [field, value]) => {
      let { message } = value;
      const { validateType } = value;
      const languageErr = validationErr[validateType];

      if (languageErr)
        message = message.replace(languageErr['en'], languageErr[language]);

      Object.assign(prev, { [field]: message });

      return prev;
    }, {} as T);
  }

  if (error instanceof Object) return error[language];

  return error;
};

@Catch()
export class GatewayExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = getStatusCode<T>(exception);
    const language = request.query['lang'] || defaultLang;
    let errors = getErrorMessage<T>(exception);

    if (typeof language === 'string')
      errors = translateError<T>(errors, language);

    response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      errors,
    });
  }
}
