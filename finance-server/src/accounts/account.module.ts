import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import dotenv from 'dotenv';
import { Account } from './account.model';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ChatGateway } from 'src/chat.gateway';

dotenv.config();

@Module({
  imports: [SequelizeModule.forFeature([Account])],
  providers: [AccountService, JwtStrategy, ChatGateway],
  exports: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
