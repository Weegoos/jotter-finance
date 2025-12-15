import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AIProject, ProjectType } from './ai_project.model';
import { AIConversation } from 'src/ai_conversation/ai_conversation.model';
import { IAIProject } from './interface/ai_project.interface';

@Injectable()
export class AIProjectService {
  constructor(
    @InjectModel(AIProject)
    private readonly aiProjectModel: typeof AIProject,

    @InjectModel(AIConversation)
    private readonly aiConversationModel: typeof AIConversation,
  ) {}

  async create(
    user_id: number,
    project: Partial<IAIProject>,
  ): Promise<AIProject> {
    if (!user_id) {
      throw new UnauthorizedException('User not authorized');
    }

    if (!project.title) {
      throw new Error('Title is required');
    }

    const created = await this.aiProjectModel.create({
      user_id: user_id,
      title: project.title,
      type: project.type || ProjectType.FINANCE,
    });

    return created;
  }

  async findAll(user_id: number): Promise<any> {
    if (!user_id) {
      throw new UnauthorizedException('User not authorized');
    }

    return await this.aiProjectModel.findAll({
      where: {
        user_id: user_id,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async findAllByProjectId(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestException('Project not found');
    }

    return await this.aiProjectModel.findAll({
      where: {
        id: id,
      },
      order: [['createdAt', 'ASC']],
    });
  }
}
