import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
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
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Current Budget does not exist' })
  async create(
    @Req() req: any,
    @Body() budget: CreateBudgetDTO,
  ): Promise<IBudget> {
    const newBudget = await this.budgetService.create(req.user.id, budget);
    const allBudgets = await this.budgetService.findAll(req.user.id);
    this.chatGateway.server.emit('budgetUpdated', allBudgets);
    return newBudget;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all budgets for a user' })
  @ApiResponse({ status: 201, description: 'Budget obtained successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllBudget(@Req() req: any): Promise<IBudget[]> {
    return this.budgetService.findAll(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('stats')
  @ApiOperation({ summary: 'Get stats of budget' })
  @ApiResponse({
    status: 201,
    description: 'Budget stats obtained successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@Req() req: any): Promise<any> {
    return this.budgetService.stats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Budget deleted successfully' })
  @ApiResponse({
    status: 201,
    description: 'Budget deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'The request is denied' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async delete(@Req() req: any, @Param('id') id: number): Promise<void> {
    const deletedBudget = await this.budgetService.delete(req.user.id, id);
    const allBudgets = await this.budgetService.findAll(req.user.id);
    this.chatGateway.server.emit('budgetUpdated', allBudgets);
    return deletedBudget;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Budget has been successfully changed' })
  @ApiResponse({
    status: 201,
    description: 'Budget updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'The request is denied' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async update(
    @Req() req: any,
    @Body() updates: CreateBudgetDTO,
    @Param('id') id: number,
  ): Promise<IBudget> {
    const updatedBudget = await this.budgetService.update(
      id,
      req.user.id,
      updates,
    );
    const allBudgets = await this.budgetService.findAll(req.user.id);
    this.chatGateway.server.emit('budgetUpdated', allBudgets);
    return updatedBudget;
  }
}
