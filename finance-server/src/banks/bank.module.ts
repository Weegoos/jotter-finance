import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bank } from './bank.model';
import { BankService } from './bank.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { BankController } from './bank.controller';

@Module({
  imports: [SequelizeModule.forFeature([Bank])],
  providers: [BankService, JwtStrategy],
  exports: [BankService],
  controllers: [BankController],
})
export class BankModule {}
