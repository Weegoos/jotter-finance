import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from 'src/accounts/account.model';
import { Bank } from 'src/banks/bank.model';
import { Budget } from 'src/budget/budget.model';
import { Categories } from 'src/categories/categories.model';
import { Transactions } from 'src/transaction/transaction.model';

@Injectable()
export class StatService {
  constructor(
    @InjectModel(Account)
    private readonly accountModel: typeof Account,

    @InjectModel(Budget)
    private readonly budgetModel: typeof Budget,

    @InjectModel(Transactions)
    private readonly transactionModel: typeof Transactions,

    @InjectModel(Bank)
    private readonly bankModel: typeof Bank,
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

      console.log(categories);
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
      total_balance: totalBalance,
      budgets: budgetsProgress,
      categories,
      data,
    };
  }

  async getPaymentType(userId: number): Promise<any> {
    const expenses = await this.transactionModel.findAll({
      where: {
        userId: userId,
        type: 'expense',
      },
    });

    const incomes = await this.transactionModel.findAll({
      where: {
        userId: userId,
        type: 'income',
      },
    });

    const types = [expenses.length, incomes.length];
    const payment_types = ['expense', 'income'];
    return {
      types,
      payment_types,
    };
  }
  async getTransactionSeriesWithDates(
    userId: number,
  ): Promise<{ series: any[]; categories: string[] }> {
    const transactions = await this.transactionModel.findAll({
      where: { userId },
      include: { model: Account, as: 'account' },
    });

    const uniqueDatesSet = new Set<string>();
    transactions.forEach((tx) => {
      const date = tx.dataValues.date.slice(0, 10);
      uniqueDatesSet.add(date);
    });

    const categories = Array.from(uniqueDatesSet).sort();

    const seriesMap: Record<string, Record<string, number>> = {};

    transactions.forEach((tx) => {
      const bankName = tx.dataValues.account?.dataValues.name || 'Unknown';
      const date = tx.dataValues.date.slice(0, 10);

      if (!seriesMap[bankName]) seriesMap[bankName] = {};
      seriesMap[bankName][date] = tx.dataValues.amount;
    });

    const series = Object.entries(seriesMap).map(([name, dataByDate]) => {
      const data = categories.map((date) => dataByDate[date] || 0);
      return { name, data };
    });

    return { series, categories };
  }

  async getAccountStats(userId: number): Promise<any> {
    // Получаем аккаунты с их банками
    const accounts = await this.accountModel.findAll({
      where: { userId, active: true },
      include: [
        {
          model: this.bankModel,
          as: 'bank', // alias совпадает с BelongsTo
          attributes: ['id', 'name', 'type', 'currency', 'icon_url'],
        },
      ],
    });

    // Балансы и имена аккаунтов
    const series = accounts.map((acc) => acc.balance);
    const labels = accounts.map((acc) => acc.name);

    // Иконки банков
    const banks = accounts.map((acc) => acc.dataValues.bank || null);

    return { series, labels, banks };
  }
}
