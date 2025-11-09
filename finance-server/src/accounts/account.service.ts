import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from './account.model';
import { PaginatedAccounts } from './interface/paginatedAccount.interface';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
  ) {}

  async create(userId: number, account: Partial<Account>): Promise<Account> {
    const newAccount = { ...account, userId };
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    if (!newAccount.name || !newAccount.currency || !newAccount.type) {
      throw new BadRequestException('Missing required account fields');
    }
    return this.accountModel.create(newAccount);
  }

  async findAllByUserId(
    userId: number,
    active?: boolean,
    paginationDTO?: PaginationDto,
  ): Promise<PaginatedAccounts> {
    const page = paginationDTO?.page ?? 1;
    const limit = paginationDTO?.limit ?? 10;
    const offset = (page - 1) * limit;
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const where: any = { userId };

    if (typeof active === 'boolean') {
      where.active = active;
    }

    const { count, rows } = await this.accountModel.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });

    const accounts: Account[] = rows.map((row) =>
      row.get({ plain: true }),
    ) as Account[];
    const totalPages = Math.ceil(count / limit);

    return {
      data: accounts,
      totalCount: count,
      totalPages,
      currentPage: page,
    };
  }

  async destroy(id: number, userId: number): Promise<void> {
    const account = await this.accountModel.findByPk(id);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.dataValues.userId !== userId) {
      throw new UnauthorizedException(
        'User not authorized to delete this account',
      );
    }

    await account.destroy();
  }

  async update(
    id: number,
    userId: number,
    updates: Partial<Account>,
  ): Promise<Account> {
    const account = await this.accountModel.findByPk(id);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.dataValues.userId !== userId) {
      throw new ForbiddenException(
        'User not authorized to delete this account',
      );
    }

    return account.update(updates);
  }
}
