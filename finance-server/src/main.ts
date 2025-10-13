import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Jotter Finance Monitoring API')
    .setDescription('Управление финансами и мониторинг')
    .setVersion('1.0.0')
    .addBearerAuth() // если нужен JWT auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // документация будет доступна по /api

  await app.listen(3000);
}
bootstrap();
