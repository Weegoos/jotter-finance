import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Account } from '../accounts/account.model';
import { Categories } from '../categories/categories.model';
import { ITransaction } from './interface/transaction.interface';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Table({ tableName: 'Transactions' })
export class Transactions extends Model<Transactions, ITransaction> {
  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  accountId: number;

  @ForeignKey(() => Categories)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  categoryId?: number;

  @BelongsTo(() => Account)
  account: Account;

  @BelongsTo(() => Categories)
  categories?: Categories;

  @Column({
    type: DataType.DECIMAL(14, 2),
  })
  amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionType)),
    allowNull: false,
  })
  type: TransactionType;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  date: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  repeat_rule?: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;
}
