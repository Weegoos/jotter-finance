import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { Transactions } from '../transaction/transaction.model';
import { IAccount } from './interface/account.interface';

@Table
export class Account extends Model<Account, IAccount> {
  @Column
  declare name: string;

  @Column
  declare userId: number;

  @Column
  declare balance: number;

  @Column
  declare currency: string;

  @Column
  declare type: string;

  @Column
  declare active: boolean;

  @HasMany(() => Transactions)
  declare transactions: Transactions[];
}
