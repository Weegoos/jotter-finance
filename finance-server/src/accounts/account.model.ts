import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { Transactions } from '../transaction/transaction.model';

@Table
export class Account extends Model {
  @Column
  name: string;
  @Column
  userId: number;
  @Column
  balance: number;
  @Column
  currency: string;
  @Column
  type: string;
  @Column
  active: boolean;

  @HasMany(() => Transactions)
  transactions: Transactions[];
}
