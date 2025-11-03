import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Categories } from './categories.model';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [SequelizeModule.forFeature([Categories])],
  providers: [CategoriesService, JwtStrategy],
  exports: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
