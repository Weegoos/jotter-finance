import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PromoCodes, PromoCodesAttributes } from './promoCodes.model';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectModel(PromoCodes)
    private readonly promoCodesModel: typeof PromoCodes,
  ) {}

  async onModuleInit() {
    const existing = await this.promoCodesModel.count();

    if (existing > 0) {
      return;
    }

    const promoCodeSeed: Omit<PromoCodesAttributes, 'id'>[] = [
      {
        code: 'WELCOME10',
        discountType: 'percent',
        discountValue: 10,
        expiresAt: new Date('2025-12-31'),
        isActive: true,
      },
    ];

    await this.promoCodesModel.bulkCreate(promoCodeSeed);
  }
}
