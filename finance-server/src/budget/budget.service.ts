import {
  BadRequestException,
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
import { Sequelize } from 'sequelize';

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

    if (!budget.category_id) {
      throw new BadRequestException('category_id is required');
    }
    const category = await this.categoriesModel.findOne({
      where: {
        id: budget.category_id,
        userId,
      },
    });
    if (!category) {
      throw new HttpException(
        'Current Category does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const activeBudget = await this.budgetModel.findOne({
      where: { userId, status: 'active', category_id: budget.category_id },
    });

    if (activeBudget && budget.status === 'active') {
      throw new BadRequestException(
        'You already have an active budget for this category',
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
      order: [
        [
          Sequelize.literal(`CASE WHEN status = 'active' THEN 1 ELSE 2 END`),
          'ASC',
        ],
        ['createdAt', 'DESC'],
      ],
      include: {
        model: Categories,
      },
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
    console.log(budget);

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (budget.dataValues.userId !== userId) {
      throw new ForbiddenException('The request is denied');
    }

    // Проверяем, если пытаемся установить статус active
    if (updates.status === 'inactive') {
      if (!budget.dataValues.category_id) {
        throw new BadRequestException('Budget category_id is missing');
      }

      const activeBudget = await this.budgetModel.findOne({
        where: {
          userId,
          status: 'active',
          category_id: budget.dataValues.category_id,
        },
      });

      if (activeBudget) {
        throw new BadRequestException(
          'You already have an active budget for this category',
        );
      }
    }

    return budget.update(updates);
  }
}
