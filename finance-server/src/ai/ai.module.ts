// src/reports/reports.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transactions } from 'src/transaction/transaction.model';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { Account } from 'src/accounts/account.model';
import { Budget } from 'src/budget/budget.model';

@Module({
  imports: [SequelizeModule.forFeature([Transactions, Account, Budget])],
  controllers: [AIController],
  providers: [AIService],
})
export class AIModule {}
