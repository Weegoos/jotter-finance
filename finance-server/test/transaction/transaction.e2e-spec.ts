import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module'; // <-- импортируем основной модуль
import * as request from 'supertest';

describe('Transaction (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule], // <-- подключаем AppModule
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/GET transactions', async () => {
    const response = await request(app.getHttpServer())
      .get('/transactions')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
