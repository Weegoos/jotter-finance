import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from 'src/accounts/account.model';
import { Budget } from 'src/budget/budget.model';
import { Categories } from 'src/categories/categories.model';

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

  async goalProgress(userId: number): Promise<{
    total_balance: number;
    budgets: Object[];
    categories: string[];
    data: number[];
  }> {
    if (!userId) throw new UnauthorizedException('User not authorized');

    const budgets = await this.budgetModel.findAll({
      where: { userId, status: 'active' },
      include: [
        {
          model: Categories,
          as: 'categories',
          attributes: ['name'],
        },
      ],
    });

    if (!budgets.length) throw new NotFoundException('No active budgets found');

    const accounts = await this.accountModel.findAll({
      where: { userId, active: true },
      attributes: ['balance'],
    });

    const totalBalance = accounts.reduce(
      (sum, account) => sum + (account.dataValues.balance || 0),
      0,
    );

    const categories: string[] = [];
    const data: number[] = [];

    const budgetsProgress = budgets.map((budget) => {
      const progress =
        budget.dataValues.amount > 0
          ? Number((totalBalance / budget.dataValues.amount).toFixed(2))
          : 0;

      categories.push(
        budget.dataValues.categories.dataValues.name || 'Unknown',
      );
      data.push(progress);

      console.log(categories); // ['Food', 'Rent', 'Savings', ...]
      console.log(data);
      return {
        budget_id: budget.id,
        category_id: budget.category_id,
        category: budget.dataValues.categories || '',
        goal_amount: budget.dataValues.amount,
        progress,
      };
    });

    return {
      total_balance: totalBalance, // один раз общий баланс
      budgets: budgetsProgress,
      categories,
      data,
    };
  }
}
