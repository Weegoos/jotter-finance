import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Budget } from './budget.model';
import { CreateBudgetDTO } from './dto/budget-create.dto';
import { Categories } from 'src/categories/categories.model';
import { IBudget } from './interface/budget.interface';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(Budget)
    private readonly budgetModel: typeof Budget,
    @InjectModel(Categories)
    private readonly categoriesModel: typeof Categories,
  ) {}

  async create(userId: number, budget: CreateBudgetDTO): Promise<Budget> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const category = await this.categoriesModel.findOne({
      where: {
        id: budget.categoryId,
        userId,
      },
    });
    if (!category) {
      throw new HttpException(
        'Current Category does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newBudget: IBudget = {
      ...budget,
      userId,
    };

    return this.budgetModel.create(newBudget as any);
  }

  async findAll(userId: number): Promise<Budget[]> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    return this.budgetModel.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
    });
  }

  async delete(userId: number, id: number): Promise<void> {
    const budget = await this.budgetModel.findByPk(id);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (budget.dataValues.userId !== userId) {
      throw new ForbiddenException('The request is denied');
    }

    await budget.destroy();
  }

  async update(
    id: number,
    userId: number,
    updates: Partial<Budget>,
  ): Promise<Budget> {
    const budget = await this.budgetModel.findByPk(id);

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (budget.dataValues.userId !== userId) {
      throw new ForbiddenException('The request is denied');
    }

    return budget.update(updates);
  }
}
