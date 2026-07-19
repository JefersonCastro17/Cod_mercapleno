import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; //swagger
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { envs } from './config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadsRoot = join(process.cwd(), 'uploads');

  // Prevent browser requests for /favicon.ico from generating NotFoundExceptions
  // Return 204 (No Content) early to keep logs clean when no favicon is provided.
  app.use((req: any, res: any, next: any) => {
    if (req.url === '/favicon.ico' || req.originalUrl === '/favicon.ico') {
      res.status(204).end();
      return;
    }
    next();
  });

  mkdirSync(uploadsRoot, { recursive: true });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: envs.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    maxAge: 3600,
  });
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
    .setDescription('Documentación de la API de Mercapleno') //cambiar por una descripción más adecuada a la API
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
