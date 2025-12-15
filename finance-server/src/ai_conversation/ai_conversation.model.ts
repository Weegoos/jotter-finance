import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { AIProject } from 'src/project/ai_project.model';

export interface AIConversationAttributes {
  id?: string;
  user_id: number;
  title: string;
  project_id?: string | null;
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

  @ForeignKey(() => AIProject)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    defaultValue: null,
  })
  declare project_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @BelongsTo(() => AIProject)
  declare project: AIProject;
}
