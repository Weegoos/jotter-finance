import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AIProject } from './ai_project.model';
import { AIProjectService } from './ai_project.service';
import { AIProjectController } from './ai_project.controller';
import { AIConversation } from 'src/ai_conversation/ai_conversation.model';

@Module({
  imports: [SequelizeModule.forFeature([AIProject, AIConversation])],
  providers: [AIProjectService],
  exports: [AIProjectService],
  controllers: [AIProjectController],
})
export class AIProjectModule {}
