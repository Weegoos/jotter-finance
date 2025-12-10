import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('ai')
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('advice')
  @ApiOperation({ summary: 'Get all transactions using AI' })
  @ApiResponse({
    status: 201,
    description: 'Transaction obtained successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactionUsingAI(@Req() req: any) {
    const data = await this.aiService.getTransactionData(req.user.id);
    return { data };
  }
}
