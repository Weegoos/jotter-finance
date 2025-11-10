import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from 'src/accounts/account.model';

@Injectable()
export class StatService {
  constructor(
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
  ) {}

  async totalBalance(userId: number): Promise<Object> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const accounts = await this.accountModel.findAll({
      where: { userId },
      attributes: ['balance'],
    });
    const total = accounts.reduce(
      (sum, account) => sum + (account.dataValues.balance || 0),
      0,
    );

    const data = {
      total_balance: total,
    };
    return data;
  }
}
