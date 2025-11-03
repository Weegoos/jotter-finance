import { Table, Column, Model, DataType } from 'sequelize-typescript';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Table({ tableName: 'Categories' })
export class Categories extends Model<Categories> {
  @Column({ allowNull: false })
  userId: number;

  @Column({ allowNull: false })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(CategoryType)),
    allowNull: false,
  })
  type: CategoryType;
}
