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
        icon_url:
          'https://upload.wikimedia.org/wikipedia/ru/a/aa/Logo_of_Kaspi_bank.png',
      },
      {
        name: 'АО "Народный банк Казахстана"',
        type: 'Bank',
        currency: 'Euro',
        icon_url:
          'https://play-lh.googleusercontent.com/sT3HDsOVEk8Jj5SPo2ql2N14EZG4wXfxp2r08h_7iNSaYfeLD5-rCmVT60cxvLnG_eQ',
      },
    ];

    await this.bankModel.bulkCreate(banks);
  }

  async getAllBanks(): Promise<Bank[]> {
    return this.bankModel.findAll();
  }
}
