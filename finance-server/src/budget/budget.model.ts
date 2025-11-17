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
  @Column({ field: 'category_id', type: DataType.INTEGER })
  category_id?: number;

  @Column
  userId: number;

  @Column({ field: 'amount', type: DataType.NUMBER })
  amount: number;

  @Column
  period: string;

  @Column({
    defaultValue: 'inactive',
  })
  status: string;

  @BelongsTo(() => Categories, { as: 'categories', foreignKey: 'category_id' })
  categories?: Categories;
}
