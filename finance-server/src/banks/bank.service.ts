import { Injectable } from '@nestjs/common';
import { Bank } from './bank.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class BankService {
  constructor(
    @InjectModel(Bank)
    private readonly bankModel: typeof Bank,
  ) {}

  async onModuleInit() {
    const existing = await this.bankModel.count();

    if (existing > 0) {
      return;
    }

    const banks = [
      {
        name: 'АО "Kaspi Bank"',
        type: 'Bank',
        currency: 'Euro',
        icon_url: 'finance-server/assets/banks/KaspiBank.jpeg',
      },
    ];

    await this.bankModel.bulkCreate(banks);
  }
}
