import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { normalizeRequiredEnvVars } from './env-config';

async function bootstrap() {
  normalizeRequiredEnvVars(new Logger('Bootstrap'));

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
