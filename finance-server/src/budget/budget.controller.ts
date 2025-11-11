import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { ChatGateway } from 'src/chat.gateway';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateBudgetDTO } from './dto/budget-create.dto';
import { IBudget } from './interface/budget.interface';

@ApiTags('budget')
@Controller('budget')
export class BudgetController {
  constructor(
    private readonly budgetService: BudgetService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'budget created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Current Account does not exist' })
  async create(
    @Req() req: any,
    @Body() budget: CreateBudgetDTO,
  ): Promise<IBudget> {
    const newBudget = await this.budgetService.create(req.user.id, budget);

    return newBudget;
  }
}
