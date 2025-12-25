import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateAIProjectDto } from './dto/ai_project_create.dto';
import { IAIProject } from './interface/ai_project.interface';
import { AIProjectService } from './ai_project.service';

@ApiTags('ai_project')
@Controller('project')
export class AIProjectController {
  constructor(private readonly aiProjectService: AIProjectService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async create(
    @Req() req: any,
    @Body() project: CreateAIProjectDto,
  ): Promise<IAIProject> {
    const newProject = await this.aiProjectService.create(req.user.id, project);

    return newProject;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all projects for a user' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Req() req: any): Promise<any> {
    const projects = await this.aiProjectService.findAll(req.user.id);
    return projects;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':projectId')
  @ApiOperation({ summary: 'Get project by id' })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<any> {
    return this.aiProjectService.findAllByProjectId(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by UUID' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: String, description: 'Project UUID' })
  async delete(@Req() req: any, @Param('id') id: string): Promise<void> {
    return this.aiProjectService.destroy(id, req.user.id);
  }
}
