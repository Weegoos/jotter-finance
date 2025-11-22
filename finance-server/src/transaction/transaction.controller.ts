import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { ChatGateway } from '../chat.gateway';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionDTO } from './dto/transaction-create.dto';
import { ITransaction } from './interface/transaction.interface';
import { UpdateTransactionDTO } from './dto/transaction-update.dto';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { PaginatedTransaction } from './interface/paginatedTransaction';
import type { Response } from 'express';

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

    const allTransactions = await this.transactionService.findAll(req.user.id);
    this.chatGateway.server.emit('transactionUpdated', allTransactions);
    return newTransaction;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all transactions for a user' })
  @ApiResponse({
    status: 201,
    description: 'Transaction obtained successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllTransactions(
    @Req() req: any,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedTransaction> {
    const { data, totalCount, totalPages, currentPage } =
      await this.transactionService.findAll(req.user.id, paginationDto);
    return {
      data,
      totalCount,
      totalPages,
      currentPage,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an transaction by ID' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Req() req: any, @Param('id') id: number): Promise<void> {
    const deletedTransaction = await this.transactionService.destroy(
      id,
      req.user.id,
    );
    const allTransactions = await this.transactionService.findAll(req.user.id);
    this.chatGateway.server.emit('transactionUpdated', allTransactions);
    return deletedTransaction;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async update(
    @Req() req: any,
    @Param('id') id: number,
    @Body() updates: UpdateTransactionDTO,
  ): Promise<ITransaction> {
    const updatedTransaction = await this.transactionService.update(
      id,
      req.user.id,
      updates,
    );

    const allTransactions = await this.transactionService.findAll(req.user.id);
    this.chatGateway.server.emit('transactionUpdated', allTransactions);

    return updatedTransaction;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('export/pdf')
  @ApiOperation({ summary: 'Create a pdf file' })
  @ApiResponse({ status: 200, description: 'PDF file created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transactions not found' })
  async exportPdf(@Req() req, @Res() res: Response) {
    const userId = req.user.id; // если у тебя стоит JWT guard
    console.log(req.user);
    
    const filePath = await this.transactionService.generatePdf(
      userId,
      req.user.firstName,
      req.user.lastName
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=transactions.pdf',
    });

    return res.sendFile(filePath);
  }
}
