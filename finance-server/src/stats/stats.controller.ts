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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('payment_types')
  @ApiOperation({ summary: 'Get a payment type' })
  @ApiResponse({
    status: 201,
    description: 'Payment Types obtained successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async payment_types(@Req() req: any): Promise<any> {
    const payment = await this.statService.getPaymentType(req.user.id);

    return payment;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('transaction_stats')
  @ApiOperation({ summary: 'Get a transaction type' })
  @ApiResponse({
    status: 201,
    description: 'Transaction Types obtained successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async transaction_stats(@Req() req: any): Promise<any> {
    const transaction = await this.statService.getTransactionSeriesWithDates(
      req.user.id,
    );

    return transaction;
  }
}
