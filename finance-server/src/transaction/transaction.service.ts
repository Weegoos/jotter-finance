import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transactions } from './transaction.model';
import { CreateTransactionDTO } from './dto/transaction-create.dto';
import { ITransaction } from './interface/transaction.interface';
import { Account } from 'src/accounts/account.model';
import { Categories } from 'src/categories/categories.model';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transactions)
    private readonly transactionModel: typeof Transactions,
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
    @InjectModel(Categories)
    private readonly categoriesModel: typeof Categories,
  ) {}

  async create(
    userId: number,
    transaction: CreateTransactionDTO,
  ): Promise<Transactions> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const account = await this.accountModel.findOne({
      where: {
        id: transaction.accountId,
        userId,
      },
    });
    if (!account) {
      throw new HttpException(
        'Current Account does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const category = await this.categoriesModel.findOne({
      where: {
        id: transaction.categoryId,
        userId,
      },
    });
    if (!category) {
      throw new HttpException(
        'Current Category does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newTransaction: ITransaction = {
      ...transaction,
      userId,
    };

    return this.transactionModel.create(newTransaction);
  }

  async findAll(userId: number): Promise<Transactions[]> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    return this.transactionModel.findAll({
      where: { userId },
    });
  }

  async destroy(id: number, userId: number): Promise<void> {
    const transaction = await this.transactionModel.findByPk(id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.dataValues.userId !== userId) {
      throw new UnauthorizedException(
        'User not authorized to delete this account',
      );
    }

    await transaction.destroy();
  }
}
