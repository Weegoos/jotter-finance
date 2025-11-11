import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from 'src/accounts/account.model';

@Injectable()
export class StatService {
  constructor(
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
  ) {}

  async totalBalance(userId: number): Promise<{ total_balance: number }> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const accounts = await this.accountModel.findAll({
      where: { userId, active: true },
      attributes: ['balance', 'active'],
    });

    const total = accounts.reduce(
      (sum, account) => sum + (account.dataValues.balance || 0),
      0,
    );

    return { total_balance: total };
  }
}
