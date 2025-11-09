import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transactions } from './transaction.model';
import { TransactionService } from './transaction.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { ChatGateway } from '../chat.gateway';
import { TransactionController } from './transaction.controller';
import { Account } from '../accounts/account.model';
import { Categories } from '../categories/categories.model';

@Module({
  imports: [SequelizeModule.forFeature([Transactions, Account, Categories])],
  providers: [TransactionService, JwtStrategy, ChatGateway],
  exports: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
