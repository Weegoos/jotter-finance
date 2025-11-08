import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transactions } from './transaction.model';
import { TransactionService } from './transaction.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ChatGateway } from 'src/chat.gateway';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [SequelizeModule.forFeature([Transactions])],
  providers: [TransactionService, JwtStrategy, ChatGateway],
  exports: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
