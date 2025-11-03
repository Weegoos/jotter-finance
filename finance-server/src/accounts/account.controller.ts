import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { IAccount } from './interface/account.interface';
import { AccountService } from './account.service';
import { AccountDTO } from './dto/account-create.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AccountStatusUpdate } from './dto/account-status-update.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async create(
    @Req() req: any,
    @Body() account: AccountDTO,
  ): Promise<IAccount> {
    return this.accountService.create(req.user.id, account);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all accounts for a user' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Req() req: any): Promise<IAccount[]> {
    return this.accountService.findAllByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':active')
  @ApiOperation({ summary: 'Get all accounts for a user' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllByStatus(
    @Req() req: any,
    @Param('active') activeParam: string,
  ): Promise<IAccount[]> {
    const userId = req.user.id;

    // Явно преобразуем строку в boolean
    let active: boolean | undefined;
    if (activeParam === 'true') active = true;
    else if (activeParam === 'false') active = false;
    else active = undefined;

    return this.accountService.findAllByUserId(userId, active);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account by ID' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Req() req: any, @Param('id') id: number): Promise<void> {
    return this.accountService.destroy(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update an account by ID' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async update(
    @Req() req: any,
    @Param('id') id: number,
    @Body() updates: AccountDTO,
  ): Promise<IAccount> {
    return this.accountService.update(id, req.user.id, updates);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a status by ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async updateId(
    @Req() req: any,
    @Body() updates: AccountStatusUpdate,
    @Param('id') id: number,
  ): Promise<IAccount> {
    return this.accountService.update(id, req.user.id, updates);
  }
}
