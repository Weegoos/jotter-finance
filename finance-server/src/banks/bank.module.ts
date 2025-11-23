import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bank } from './bank.model';
import { BankService } from './bank.service';

@Module({
  imports: [SequelizeModule.forFeature([Bank])],
  providers: [BankService],
  exports: [BankService],
})
export class BankModule {}
