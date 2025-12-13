import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AIMessage } from './ai_message.model';
import { AIConversation } from 'src/ai_conversation/ai_conversation.model';
import { IAIMessage } from './interface/ai_message.interface';

@Injectable()
export class AIMessageService {
  constructor(
    @InjectModel(AIMessage)
    private readonly aiMessageModel: typeof AIMessage,
    @InjectModel(AIConversation)
    private readonly aiConversationModel: typeof AIConversation,
  ) {}

  async create(userId: number, message: IAIMessage): Promise<AIMessage> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const conversation = await this.aiConversationModel.findByPk(
      message.conversationId,
    );

    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }

    return this.aiMessageModel.create({
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
    });
  }

  async findAll(conversationId: string): Promise<any> {
    if (!conversationId) {
      throw new BadRequestException('Conversation not found');
    }

    return await this.aiMessageModel.findAll({
      where: {
        conversationId: conversationId,
      },
      order: [['createdAt', 'ASC']],
    });
  }
}
