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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { ChatGateway } from 'src/chat.gateway';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTransactionDTO } from './dto/transaction-create.dto';
import { ITransaction } from './interface/transaction.interface';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Current Account does not exist' })
  async create(
    @Req() req: any,
    @Body() transaction: CreateTransactionDTO,
  ): Promise<ITransaction> {
    const newTransaction = await this.transactionService.create(
      req.user.id,
      transaction,
    );

    return newTransaction;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all transactions for a user' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllTransactions(@Req() req: any): Promise<ITransaction[]> {
    return this.transactionService.findAll(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an transaction by ID' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Req() req: any, @Param('id') id: number): Promise<void> {
    return this.transactionService.destroy(id, req.user.id);
  }
}
