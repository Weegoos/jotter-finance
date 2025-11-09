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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCategoryDTO } from './dto/categories-create.dto';
import { ICategory } from './interface/category.interface';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async create(
    @Req() req: any,
    @Body() category: CreateCategoryDTO,
  ): Promise<ICategory> {
    return this.categoriesService.create(req.user.id, category);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all categories for a user' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findAllCategories(@Req() req: any): Promise<ICategory[]> {
    return this.categoriesService.findAll(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Category deleted successfully' })
  @ApiResponse({
    status: 201,
    description: 'Categories deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'The request is denied' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(
    @Req() req: any,
    @Param('id') id: number,
  ): Promise<void> {
    return this.categoriesService.delete(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Category has been successfully changed' })
  @ApiResponse({
    status: 201,
    description: 'Categories deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'The request is denied' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateId(
    @Req() req: any,
    @Body() updates: CreateCategoryDTO,
    @Param('id') id: number,
  ): Promise<ICategory> {
    return this.categoriesService.update(id, req.user.id, updates);
  }
}
