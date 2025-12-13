import { Table, Column, Model, DataType } from 'sequelize-typescript';

export interface PromoCodesAttributes {
  id?: number; // если будет авто-инкремент
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  expiresAt: Date;
  isActive: boolean;
}

@Table({ tableName: 'PromoCodes' })
export class PromoCodes extends Model<
  PromoCodesAttributes,
  Omit<PromoCodesAttributes, 'id'>
> {
  @Column({ type: DataType.STRING, allowNull: false })
  declare code: string;

  @Column({ type: DataType.ENUM('percent', 'fixed'), allowNull: false })
  declare discountType: 'percent' | 'fixed';

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare discountValue: number;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;
}
