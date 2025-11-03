import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Categories } from './categories.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories)
    private readonly categoriesModel: typeof Categories,
  ) {}
}
