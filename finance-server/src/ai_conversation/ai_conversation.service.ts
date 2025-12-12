import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AIConversation } from './ai_conversation.model';
import { IAIConversation } from './interface/ai_conversation.interface';

@Injectable()
export class AIConversationService {
  constructor(
    @InjectModel(AIConversation)
    private readonly aiConversationModel: typeof AIConversation,
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
}
