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
  @Get('total_balance')
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Current Account does not exist' })
  async get_balance(@Req() req: any): Promise<any> {
    const total_balance = await this.statService.totalBalance(req.user.id);
    return total_balance;
  }
}
