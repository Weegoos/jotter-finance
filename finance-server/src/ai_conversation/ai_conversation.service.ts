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
    userId: number,
    conversation: Partial<IAIConversation>,
  ): Promise<AIConversation> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    if (!conversation.title) {
      throw new Error('Title is required');
    }

    const created = await this.aiConversationModel.create({
      user_id: userId,
      title: conversation.title,
    });

    return created;
  }
}
