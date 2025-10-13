import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class Budget extends Model {
  @Column
  amount: number;

  @Column
  category: string;

  @Column
  userId: number;
}
