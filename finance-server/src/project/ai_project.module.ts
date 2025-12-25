import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AIProject } from './ai_project.model';
import { AIProjectService } from './ai_project.service';
import { AIProjectController } from './ai_project.controller';
import { AIConversation } from 'src/ai_conversation/ai_conversation.model';
import { AIMessage } from 'src/ai_message/ai_message.model';

@Module({
  imports: [SequelizeModule.forFeature([AIProject, AIConversation, AIMessage])],
  providers: [AIProjectService],
  exports: [AIProjectService],
  controllers: [AIProjectController],
})
export class AIProjectModule {}
