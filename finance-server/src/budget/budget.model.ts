import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Categories } from 'src/categories/categories.model';

@Table({ tableName: 'Budget' })
export class Budget extends Model {
  @ForeignKey(() => Categories)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  categoryId?: number;

  @Column
  userId: number;

  @Column
  amount: number;

  @Column
  period: string;

  @Column({
    defaultValue: 'inactive',
  })
  status: string;

  @BelongsTo(() => Categories)
  categories?: Categories;
}
