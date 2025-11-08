import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transactions } from './transaction.model';
import { TransactionService } from './transaction.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ChatGateway } from 'src/chat.gateway';
import { TransactionController } from './transaction.controller';
import { Account } from 'src/accounts/account.model';
import { Categories } from 'src/categories/categories.model';

@Module({
  imports: [SequelizeModule.forFeature([Transactions, Account, Categories])],
  providers: [TransactionService, JwtStrategy, ChatGateway],
  exports: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
