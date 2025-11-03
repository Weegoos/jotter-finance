import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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

  async findAll(userId: number): Promise<Categories[]> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    return this.categoriesModel.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
    });
  }

  async delete(userId: number, id: number): Promise<void> {
    const category = await this.categoriesModel.findByPk(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.dataValues.userId !== userId) {
      throw new ForbiddenException('The request is denied');
    }

    await category.destroy();
  }

  async update(
    id: number,
    userId: number,
    updates: Partial<Categories>,
  ): Promise<Categories> {
    const category = await this.categoriesModel.findByPk(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.dataValues.userId !== userId) {
      throw new ForbiddenException('The request is denied');
    }

    return category.update(updates);
  }
}
