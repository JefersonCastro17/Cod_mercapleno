import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; //swagger
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadsRoot = join(process.cwd(), 'uploads');

  mkdirSync(uploadsRoot, { recursive: true });

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useStaticAssets(uploadsRoot, { prefix: '/uploads/' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder() //swagger
    .setTitle('Mercapleno API')
    .setDescription('Lo mas fino del pedazo') //cambiar por una descripción más adecuada a la API
    .setVersion('2.0.0')
    .addBearerAuth()
    .addSecurity('x-api-key', {
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
      description: 'Clave API para acceso a rutas protegidas',
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig); //swagger 
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(envs.port);
  // eslint-disable-next-line no-console
  console.log(`Mercapleno backend corriendo en http://localhost:${envs.port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger: http://localhost:${envs.port}/api/docs`);
}

bootstrap();
