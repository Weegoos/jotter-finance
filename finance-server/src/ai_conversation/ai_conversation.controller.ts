import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AIConversationService } from './ai_conversation.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IAIConversation } from './interface/ai_conversation.interface';
import { CreateAIConversationDto } from './dto/conversation-create.dto';

@ApiTags('conversation')
@Controller('conversation')
export class AIConversationController {
  constructor(private readonly aiConversationService: AIConversationService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async create(
    @Req() req: any,
    @Body() conversation: CreateAIConversationDto,
  ): Promise<IAIConversation> {
    const newConversation = await this.aiConversationService.create(
      req.user.id,
      conversation,
    );

    return newConversation;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all convesations for a user' })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Req() req: any): Promise<any> {
    const conversations = await this.aiConversationService.findAll(req.user.id);
    return conversations;
  }
}
