import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from 'src/accounts/account.model';
import { Budget } from 'src/budget/budget.model';

@Injectable()
export class StatService {
  constructor(
    @InjectModel(Account)
    private readonly accountModel: typeof Account,

    @InjectModel(Budget)
    private readonly budgetModel: typeof Budget,
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

  async goalProgress(userId: number): Promise<Object> {
    if (!userId) throw new UnauthorizedException('User not authorized');

    const budget = await this.budgetModel.findOne({ where: { userId } });
    if (!budget) throw new NotFoundException('The Budget does not exists');

    const accounts = await this.accountModel.findAll({
      where: { userId, active: true },
      attributes: ['balance'],
    });

    const totalBalance = accounts.reduce(
      (sum, account) => sum + (account.dataValues.balance || 0),
      0,
    );

    const progress =
      budget.dataValues.amount > 0
        ? Number((totalBalance / budget.dataValues.amount).toFixed(2))
        : 0;

    return {
      total_balance: totalBalance,
      goal_amount: budget.dataValues.amount,
      progress, // как число 0.72
    };
  }
}
