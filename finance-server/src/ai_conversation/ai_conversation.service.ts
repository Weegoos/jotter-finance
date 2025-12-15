import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AIConversation } from './ai_conversation.model';
import { IAIConversation } from './interface/ai_conversation.interface';
import { AIMessage } from 'src/ai_message/ai_message.model';

@Injectable()
export class AIConversationService {
  constructor(
    @InjectModel(AIConversation)
    private readonly aiConversationModel: typeof AIConversation,

    @InjectModel(AIMessage)
    private readonly aiMessageModel: typeof AIMessage,
  ) {}

  async create(
    user_id: number,
    conversation: Partial<IAIConversation>,
  ): Promise<AIConversation> {
    if (!user_id) {
      throw new UnauthorizedException('User not authorized');
    }

    if (!conversation.title) {
      throw new Error('Title is required');
    }

    const created = await this.aiConversationModel.create({
      user_id: user_id,
      title: conversation.title,
      project_id: conversation.project_id,
    });

    return created;
  }

  async findAll(user_id: number): Promise<any> {
    if (!user_id) {
      throw new UnauthorizedException('User not authorized');
    }

    return await this.aiConversationModel.findAll({
      where: {
        user_id: user_id,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async findAllByProjectId(project_id: string): Promise<any> {
    if (!project_id) {
      throw new BadRequestException('Project not found');
    }

    return await this.aiConversationModel.findAll({
      where: {
        project_id: project_id,
      },
      order: [['createdAt', 'ASC']],
    });
  }

  async destroy(id: string, userId: string) {
    const conversation = await this.aiConversationModel.findByPk(id);

    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.dataValues.user_id !== Number(userId)) {
      throw new UnauthorizedException('User not authorized');
    }

    await this.aiMessageModel.destroy({
      where: { conversationId: id },
    });

    await conversation.destroy();
  }

  async update(
    id: string,
    userId: number,
    updates: Partial<IAIConversation>,
  ): Promise<AIConversation> {
    const conversation = await this.aiConversationModel.findByPk(id);

    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.dataValues.user_id !== Number(userId)) {
      throw new UnauthorizedException('User not authorized');
    }

    const updatedConversation = await conversation.update(updates);
    return updatedConversation;
  }
}
