import {
  HttpException,
  HttpStatus,
  Injectable,
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
}
