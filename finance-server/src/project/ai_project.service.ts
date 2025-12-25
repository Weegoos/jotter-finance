import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AIProject, ProjectType } from './ai_project.model';
import { AIConversation } from 'src/ai_conversation/ai_conversation.model';
import { IAIProject } from './interface/ai_project.interface';
import { AIMessage } from 'src/ai_message/ai_message.model';

@Injectable()
export class AIProjectService {
  constructor(
    @InjectModel(AIProject)
    private readonly aiProjectModel: typeof AIProject,

    @InjectModel(AIConversation)
    private readonly aiConversationModel: typeof AIConversation,

    @InjectModel(AIMessage)
    private readonly aiMessage: typeof AIMessage,
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
      include: [
        {
          model: this.aiConversationModel,
        },
      ],
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

  async destroy(id: string, userId: number) {
    const project = await this.aiProjectModel.findByPk(id);
    if (!project) throw new NotFoundException('Project not found');

    if (project.dataValues.user_id !== Number(userId)) {
      throw new UnauthorizedException('User not authorized');
    }

    const conversations = await this.aiConversationModel.findAll({
      where: { project_id: id },
      attributes: ['id'],
    });

    const conversationIds = conversations.map((c) => c.id);
    console.log(conversationIds);

    await this.aiMessage.destroy({
      where: {
        conversation_id: conversationIds,
      },
    });
    await this.aiConversationModel.destroy({
      where: { project_id: id },
    });

    await project.destroy();
  }
}
