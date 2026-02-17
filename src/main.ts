import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { SpaFallbackFilter } from './spa.filter'; // Import filter

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set Global Prefix agar semua route backend jadi /api/...
  app.setGlobalPrefix('api'); 

  // Pasang Filter Global untuk menangani refresh page SPA
  app.useGlobalFilters(new SpaFallbackFilter());

  app.use(json({ limit: '50mb' })); // Limit besar untuk upload file
  app.enableCors(); // Enable CORS untuk dev

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`Listening on :${port}`);
  console.log(`API Prefix: /api`);
}

bootstrap();
