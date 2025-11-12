import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StatService } from './stats.service';
import { ChatGateway } from 'src/chat.gateway';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('stats')
@Controller('stats')
export class StatController {
  constructor(
    private readonly statService: StatService,
    private readonly chatGateway: ChatGateway,
  ) {}
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('goal_progress')
  @ApiOperation({ summary: 'Get a goal progress' })
  @ApiResponse({
    status: 201,
    description: 'Goal progress obtained successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async goal_progress(@Req() req: any): Promise<any> {
    const goal = await this.statService.goalProgress(req.user.id);

    return goal;
  }
}
