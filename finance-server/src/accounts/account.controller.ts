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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatGateway } from '../chat.gateway';
import { PaginatedAccounts } from './interface/paginatedAccount.interface';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly chatGateway: ChatGateway,
  ) {}

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
    const newAccount = await this.accountService.create(req.user.id, account);

    const allAccounts = await this.accountService.findAllByUserId(req.user.id);
    this.chatGateway.server.emit('accountUpdated', allAccounts);

    return newAccount;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all accounts for a user' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Req() req: any,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedAccounts> {
    const { data, totalCount, totalPages, currentPage } =
      await this.accountService.findAllByUserId(
        req.user.id,
        undefined,
        paginationDto,
      );

    return {
      data,
      totalCount,
      totalPages,
      currentPage,
    };
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
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedAccounts> {
    const userId = req.user.id;

    let active: boolean | undefined;
    if (activeParam === 'true') active = true;
    else if (activeParam === 'false') active = false;
    else active = undefined;

    const result = await this.accountService.findAllByUserId(
      userId,
      active,
      paginationDto,
    );

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account by ID' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Req() req: any, @Param('id') id: number): Promise<void> {
    const allAccounts = await this.accountService.findAllByUserId(req.user.id);
    this.chatGateway.server.emit('accountUpdated', allAccounts);
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
    const updatedAccount = await this.accountService.update(
      id,
      req.user.id,
      updates,
    );

    const allAccounts = await this.accountService.findAllByUserId(req.user.id);

    this.chatGateway.server.emit('accountUpdated', allAccounts);

    return updatedAccount;
  }
}
