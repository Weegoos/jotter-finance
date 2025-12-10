// src/reports/reports.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transactions } from 'src/transaction/transaction.model';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';

@Module({
  imports: [SequelizeModule.forFeature([Transactions])],
  controllers: [AIController],
  providers: [AIService],
})
export class AIModule {}
