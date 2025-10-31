import { Column, Model, Table } from 'sequelize-typescript';

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
}
