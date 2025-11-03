import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Categories } from './categories.model';
import { CreateCategoryDTO } from './dto/categories-create.dto';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories)
    private readonly categoriesModel: typeof Categories,
  ) {}

  async create(
    userId: number,
    category: CreateCategoryDTO,
  ): Promise<Categories> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const { name, type } = category;

    const newCategory = await this.categoriesModel.create({
      userId,
      name,
      type,
    } as CreationAttributes<Categories>);

    return newCategory;
  }
}
