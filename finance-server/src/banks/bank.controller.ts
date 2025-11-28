import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BankService } from './bank.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Bank } from './bank.model';

@ApiTags('bank')
@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all banks' })
  @ApiResponse({ status: 201, description: 'Banks obtained successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllBanks(): Promise<Bank[]> {
    return this.bankService.getAllBanks();
  }
}
