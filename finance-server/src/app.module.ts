import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Budget } from './budget/budget.model';
import { Account } from './accounts/account.model';
import { AccountModule } from './accounts/account.module'; // модуль — отдельно

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        models: [Budget, Account], // ✅ только модели!
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
    AccountModule, // ✅ подключаем модуль Nest
  ],
})
export class AppModule {}
