import { Column, DataType, Table, Model } from 'sequelize-typescript';

export interface AIConversationAttributes {
  id?: string;
  user_id: number;
  title: string;
}

@Table({ tableName: 'Conversation' })
export class AIConversation extends Model<AIConversationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;
}
