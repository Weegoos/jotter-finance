import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AIMessage } from './ai_message.model';
import { AIConversation } from 'src/ai_conversation/ai_conversation.model';
import { AIMessageService } from './ai_message.service';
import { AIMessageContoller } from './ai_message.controller';

@Module({
  imports: [SequelizeModule.forFeature([AIMessage, AIConversation])],
  providers: [AIMessageService],
  exports: [AIMessageService],
  controllers: [AIMessageContoller],
})
export class AIMessageModule {}
