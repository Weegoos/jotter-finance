import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Jotter Finance Monitoring API')
    .setDescription('Управление финансами и мониторинг')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: ['http://localhost:9000', 'http://localhost:9001'],
    credentials: true,
  });
  await app.listen(3000);
  console.log('🚀 Swagger UI available at http://localhost:3000/api');
}
bootstrap();
