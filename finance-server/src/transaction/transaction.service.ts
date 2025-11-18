import {
  BadRequestException,
  ForbiddenException,
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
import { Account } from '../accounts/account.model';
import { Categories } from '../categories/categories.model';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { PaginatedTransaction } from './interface/paginatedTransaction';

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

    const account = await this.accountModel.findAll({
      where: {
        id: transaction.accountId,
        userId,
      },
      attributes: ['id', 'balance'],
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

    const amount = Number(transaction.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new HttpException(
        'Invalid transaction amount',
        HttpStatus.BAD_REQUEST,
      );
    }

    let balance = Number(account.getDataValue('balance')) || 0;

    if (transaction.type === 'expense') {
      if (balance < amount) {
        throw new HttpException(
          'Not enough balance in account',
          HttpStatus.BAD_REQUEST,
        );
      }
      balance -= amount;
    } else if (transaction.type === 'income') {
      balance += amount;
    } else {
      throw new HttpException(
        'Invalid transaction type',
        HttpStatus.BAD_REQUEST,
      );
    }

    // сохраняем числовой баланс
    account.setDataValue('balance', balance);
    await account.save();

    const newTransaction: ITransaction = {
      ...transaction,
      userId,
    };

    return this.transactionModel.create(newTransaction);
  }

  async findAll(
    userId: number,
    paginationDTO?: PaginationDto,
  ): Promise<PaginatedTransaction> {
    const page = paginationDTO?.page ?? 1;
    const limit = paginationDTO?.limit ?? 10;
    const offset = (page - 1) * limit;
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const { count, rows } = await this.transactionModel.findAndCountAll({
      where: { userId },
      include: [
        {
          model: this.accountModel,
          attributes: ['name'], // берем только имя счета
        },
        {
          model: this.categoriesModel,
          attributes: ['name'], // берем только имя счета
        },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });

    const transactions: Transactions[] = rows.map((row) =>
      row.get({ plain: true }),
    ) as Transactions[];
    const totalPages = Math.ceil(count / limit);

    return {
      data: transactions,
      totalCount: count,
      totalPages,
      currentPage: page,
    };
  }

  async destroy(id: number, userId: number): Promise<void> {
    const transaction = await this.transactionModel.findByPk(id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.getDataValue('userId') !== userId) {
      throw new UnauthorizedException(
        'User not authorized to delete this transaction',
      );
    }

    const account = await this.accountModel.findOne({
      where: {
        id: transaction.getDataValue('accountId'),
        userId,
      },
      attributes: ['id', 'balance'],
    });

    if (!account) {
      throw new HttpException(
        'Current Account does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const amount = Number(transaction.getDataValue('amount'));
    if (isNaN(amount) || amount <= 0) {
      throw new HttpException(
        'Invalid transaction amount',
        HttpStatus.BAD_REQUEST,
      );
    }

    let balance = Number(account.getDataValue('balance')) || 0;

    if (transaction.getDataValue('type') === 'expense') {
      balance += amount; // возвращаем при удалении расхода
    } else if (transaction.getDataValue('type') === 'income') {
      balance -= amount; // вычитаем при удалении дохода
    }

    account.setDataValue('balance', balance);
    await account.save();

    await transaction.destroy();
  }

  async update(
    id: number,
    userId: number,
    updates: Partial<Transactions>,
  ): Promise<Transactions> {
    // Находим транзакцию
    const transaction = await this.transactionModel.findByPk(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.getDataValue('userId') !== userId) {
      throw new UnauthorizedException(
        'User not authorized to update this transaction',
      );
    }

    // Находим аккаунт
    const account = await this.accountModel.findOne({
      where: {
        id: transaction.getDataValue('accountId'),
        userId,
      },
      attributes: ['id', 'balance'],
    });

    if (!account) {
      throw new HttpException(
        'Current Account does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Баланс текущего аккаунта
    let balance = Number(account.getDataValue('balance')) || 0;

    // Старая сумма транзакции
    const oldAmount = Number(transaction.getDataValue('amount')) || 0;
    const newAmount = Number(updates.amount ?? oldAmount);

    if (isNaN(newAmount) || newAmount < 0) {
      throw new HttpException(
        'Invalid transaction amount',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Корректируем баланс: убираем старую сумму, добавляем новую
    // Если тип транзакции "income" — увеличиваем, если "expense" — уменьшаем
    const type = updates.type ?? transaction.getDataValue('type');

    if (type === 'income') {
      balance = balance - oldAmount + newAmount;
    } else if (type === 'expense') {
      balance = balance + oldAmount - newAmount;
    } else {
      throw new HttpException(
        'Invalid transaction type',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Сохраняем новый баланс аккаунта
    account.setDataValue('balance', balance);
    await account.save();

    // Обновляем транзакцию
    const updatedTransaction = await transaction.update(updates);

    return updatedTransaction;
  }
}
