import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transactions } from 'src/transaction/transaction.model';
import axios from 'axios';

@Injectable()
export class AIService {
  constructor(
    @InjectModel(Transactions)
    private transactionModel: typeof Transactions,
  ) {}

  async getTransactionData(userId: number) {
    const transactions = await this.transactionModel.findAll({
      where: {
        userId,
      },
    });
    const data = transactions.map((tx) => tx.get({ plain: true }));

    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach((tx) => {
      if (tx.type === 'income') totalIncome += Number(tx.amount);
      else if (tx.type === 'expense') totalExpense += Number(tx.amount);
    });


    const income = totalIncome;
    const expenses = totalExpense;
    const messages = [
      { role: 'system', content: 'You are a financial assistant' },
      {
        role: 'user',
        content: `У меня следующие данные:
    Доходы: ${income}
    Расходы: ${expenses}
    Сделай краткий вывод о его финансовом состоянии и дай совет.`,
      },
    ];

    const response = await axios.post(
      'http://localhost:2500/llm/chat',
      {
        model: 'alemllm',
        temperature: 0.7,
        messages,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    // Берём готовое сообщение LLM
    return response.data.message;
  }
}
