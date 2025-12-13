import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transactions } from 'src/transaction/transaction.model';
import axios from 'axios';
import { Account } from 'src/accounts/account.model';
import { Budget } from 'src/budget/budget.model';

@Injectable()
export class AIService {
  constructor(
    @InjectModel(Transactions)
    private transactionModel: typeof Transactions,
    @InjectModel(Account)
    private accountModel: typeof Account,
    @InjectModel(Budget)
    private budgetModel: typeof Budget,
  ) {}

  async getTransactionData(userId: number) {
    const transactions = await this.transactionModel.findAll({
      where: {
        userId,
      },
    });

    const data = transactions.map((tx) => tx.get({ plain: true }));

    const accounts = await this.accountModel.findAll({
      where: {
        userId,
      },
    });

    const budgets = await this.budgetModel.findAll({
      where: {
        userId,
      },
    });

    const totalBalance = accounts
      .filter((account) => account.active) // только активные счета
      .reduce((sum, account) => sum + Number(account.balance), 0);

    // budgets — это массив Budget[]
    const plainBudgets = budgets.map((b) => b.get({ plain: true }));

    const budgetGoal = plainBudgets
      .filter((b) => String(b.status).trim().toLowerCase() === 'active')
      .reduce((max, b) => Math.max(max, Number(b.amount)), 0);

    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach((tx) => {
      if (tx.type === 'income') totalIncome += Number(tx.amount);
      else if (tx.type === 'expense') totalExpense += Number(tx.amount);
    });

    const income = totalIncome;
    const expenses = totalExpense;
    // const messages = [
    //   { role: 'system', content: 'You are a financial assistant' },
    //   {
    //     role: 'user',
    //     content: `У меня следующие данные:
    // Доходы в евро: ${income}
    // Расходы в евро: ${expenses}
    // Общий баланс денег в евро: ${totalBalance}
    // Моя цель в евро: ${budgetGoal}
    // Сделай краткий вывод о его финансовом состоянии и дай совет исходя из цели.`,
    //   },
    // ];

    const response = await axios.post(
      'http://localhost:2500/llm/smart-chat', // <- убедись, что путь правильный
      {
        model: 'alemllm',
        temperature: 0.7,
        conversation_history: [
          {
            role: 'assistant',
            content: 'Привет',
          },
        ],
        message: `У меня следующие данные:
Доходы в евро: ${income}
Расходы в евро: ${expenses}
Общий баланс денег в евро: ${totalBalance}
Моя цель в евро: ${budgetGoal}
Сделай краткий вывод о его финансовом состоянии и дай совет исходя из цели.`,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    // Берём готовое сообщение LLM
    return response.data.message;
  }
}
