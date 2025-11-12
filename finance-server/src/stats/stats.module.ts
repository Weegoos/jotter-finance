import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account } from 'src/accounts/account.model';
import { StatService } from './stats.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ChatGateway } from 'src/chat.gateway';
import { StatController } from './stats.controller';
import { Budget } from 'src/budget/budget.model';

@Module({
  imports: [SequelizeModule.forFeature([Account, Budget])],
  providers: [StatService, JwtStrategy, ChatGateway],
  exports: [StatService],
  controllers: [StatController],
})
export class Stats {}
