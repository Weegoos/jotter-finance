import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AIConversation } from './ai_conversation.model';
import { AIConversationService } from './ai_conversation.service';
import { AIConversationController } from './ai_conversation.controller';
import { AIMessage } from 'src/ai_message/ai_message.model';

@Module({
  imports: [SequelizeModule.forFeature([AIConversation, AIMessage])],
  providers: [AIConversationService],
  exports: [AIConversationService],
  controllers: [AIConversationController],
})
export class AIConversationModule {}
