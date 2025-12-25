import { Column, DataType, Table, Model, HasMany } from 'sequelize-typescript';
import { AIConversation } from 'src/ai_conversation/ai_conversation.model';

export enum ProjectType {
  FINANCE = 'finance',
  PROMOCODES = 'promocodes',
}

export interface AIProjectAttributes {
  id?: string;
  user_id: number;
  title: string;
  type: ProjectType;
}

@Table({ tableName: 'Project' })
export class AIProject extends Model<AIProjectAttributes> {
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

  @Column({
    type: DataType.ENUM(...Object.values(ProjectType)),
    allowNull: false,
  })
  declare type: ProjectType;

  // связи
  @HasMany(() => AIConversation)
  declare conversations: AIConversation[];
}
