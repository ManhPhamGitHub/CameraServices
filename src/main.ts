import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(33333333333, join(__dirname, '..', 'storage'));

  // app.useStaticAssets(join(__dirname, '..', 'storage'));
  app.enableCors();

  await app.listen(3456);
}
bootstrap();
