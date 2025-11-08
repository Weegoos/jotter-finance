import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transactions } from './transaction.model';
import { CreateTransactionDTO } from './dto/transaction-create.dto';
import { ITransaction } from './interface/transaction.interface';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transactions)
    private readonly transactionModel: typeof Transactions,
  ) {}

  async create(
    userId: number,
    transaction: CreateTransactionDTO,
  ): Promise<Transactions> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const newTransaction: ITransaction = {
      ...transaction,
      userId,
    };

    return this.transactionModel.create(newTransaction);
  }
}
