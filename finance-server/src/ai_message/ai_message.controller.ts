import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AIMessageService } from './ai_message.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateAIMessageDto } from './dto/create-ai-message.dto';
import { IAIMessage } from './interface/ai_message.interface';

@ApiTags('ai_messages')
@Controller('message')
export class AIMessageContoller {
  constructor(private readonly ai_messageService: AIMessageService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async create(
    @Req() req: any,
    @Body() message: CreateAIMessageDto,
  ): Promise<IAIMessage> {
    const newMessage = await this.ai_messageService.create(
      req.user.id,
      message,
    );
    return newMessage;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':conversationId')
  @ApiOperation({ summary: 'Get all messages by conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllMessagesByConversationID(
    @Param('conversationId') conversationId: string,
  ) {
    return this.ai_messageService.findAll(conversationId);
  }
}
