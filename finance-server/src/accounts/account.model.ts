import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Transactions } from '../transaction/transaction.model';
import { IAccount } from './interface/account.interface';
import { Bank } from 'src/banks/bank.model';

@Table
export class Account extends Model<Account, IAccount> {
  @ForeignKey(() => Bank)
  @Column({ type: DataType.INTEGER, allowNull: false })
  bankId: number;

  @BelongsTo(() => Bank, 'bankId')
  bank: Bank;

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
