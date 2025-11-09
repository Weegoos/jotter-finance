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

    if (transaction.dataValues.userId !== userId) {
      throw new UnauthorizedException(
        'User not authorized to delete this account',
      );
    }

    await transaction.destroy();
  }

  async update(
    id: number,
    userId: number,
    updates: Partial<Transactions>,
  ): Promise<Transactions> {
    const transaction = await this.transactionModel.findByPk(id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.dataValues.userId !== userId) {
      throw new ForbiddenException(
        'User not authorized to delete this account',
      );
    }

    return transaction.update(updates);
  }
}
