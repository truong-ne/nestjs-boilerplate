import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  errorFormatter,
  GatewayExceptionFilter,
  GatewayResponseInterceptor,
  TimeoutInterceptor,
} from '@lib/utils/index';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://podstreet.vn'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalInterceptors(
    new TimeoutInterceptor(),
    new GatewayResponseInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const message = errorFormatter(errors);
        return new BadRequestException([message]);
      },
    }),
  );

  app.useGlobalFilters(new GatewayExceptionFilter());

  //Swagger
  const config = new DocumentBuilder()
    .setTitle('POD STREET BE')
    .setDescription('MONOLITHIC ARCHITECTURE')
    .setVersion('2.0')
    .setContact('White Hat', '', 'chopper@dgchanger.com')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);

  await app.listen(4444);

  console.info(`Shop-Gateway is running on:`, 4444);
}
bootstrap();
