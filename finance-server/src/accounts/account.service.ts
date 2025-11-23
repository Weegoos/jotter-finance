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
import { ChatGateway } from 'src/chat.gateway';
import { StatService } from 'src/stats/stats.service';
import { IAccount } from './interface/account.interface';
import { Bank } from 'src/banks/bank.model';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
    private readonly statsService: StatService,
    private readonly chatGateway: ChatGateway,
    @InjectModel(Bank)
    private readonly bankModel: typeof Bank,
  ) {}

  async create(userId: number, account: Partial<IAccount>): Promise<Account> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

      const bank = await this.bankModel.findByPk(account.bankId);
  if (!bank) {
    throw new BadRequestException('Bank not found');
  }

  if (!account.bankId) {
  throw new BadRequestException('bankId is required');
}


    const newAccount: IAccount = {
      userId,
      name: account.name!,
      currency: account.currency!,
      type: account.type!,
      balance: account.balance ?? 0,
      active: account.active ?? true,
      bankId: account.bankId,
    };

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

    if (account.userId !== userId) {
      throw new ForbiddenException(
        'User not authorized to update this account',
      );
    }

    // Обновляем запись
    const updatedAccount = await account.update(updates);

    // После обновления пересчитываем total_balance
    const { total_balance } = await this.statsService.totalBalance(userId);

    // Отправляем обновление пользователю по WebSocket
    this.chatGateway.sendBalanceUpdate(userId, total_balance);

    return updatedAccount;
  }
}
