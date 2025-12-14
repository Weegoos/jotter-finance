import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { AIConversation } from 'src/ai_conversation/ai_conversation.model';

export type AIMessageRole = 'user' | 'assistant' | 'system';

@Table({
  tableName: 'ai_messages',
  timestamps: true,
})
export class AIMessage extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => AIConversation)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'conversation_id',
  })
  declare conversationId: string;

  @BelongsTo(() => AIConversation, {
    onDelete: 'CASCADE',
  })
  declare conversation: AIConversation;

  @Column({
    type: DataType.ENUM('user', 'assistant', 'system'),
    allowNull: false,
  })
  declare role: AIMessageRole;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;
}
