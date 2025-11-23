import { Table, Column, Model, DataType } from 'sequelize-typescript';

export interface BankCreationAttrs {
  name: string;
  type: string;
  currency: string;
  icon_url: string;
}
@Table({ tableName: 'Banks' })
export class Bank extends Model<Bank, BankCreationAttrs> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column(DataType.STRING)
  type: string;

  @Column(DataType.STRING)
  currency: string;

  @Column(DataType.STRING)
  icon_url: string;
}
