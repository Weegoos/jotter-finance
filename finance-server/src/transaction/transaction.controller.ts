import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
  @ApiResponse({ status: 404, description: 'User not found' })
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
}
