import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from './account.model';

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

  async findAllByUserId(userId: number, active?: boolean): Promise<Account[]> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const where: any = { userId };

    // добавляем фильтр только если active задан явно
    if (typeof active === 'boolean') {
      where.active = active;
    }

    return this.accountModel.findAll({
      where,
      order: [
        ['active', 'DESC'],
        ['updatedAt', 'DESC'],
      ],
    });
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
      throw new UnauthorizedException(
        'User not authorized to delete this account',
      );
    }

    return account.update(updates);
  }
}
