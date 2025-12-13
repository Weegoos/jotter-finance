import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PromoCodes } from './promoCodes.model';
import { PromoCodesService } from './promoCodes.service';

@Module({
  imports: [SequelizeModule.forFeature([PromoCodes])],
  providers: [PromoCodesService],
  exports: [PromoCodesService],
  //   controllers: [BankController],
})
export class PromoCodesModule {}
