import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Categories } from './categories.model';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { ChatGateway } from 'src/chat.gateway';

@Module({
  imports: [SequelizeModule.forFeature([Categories])],
  providers: [CategoriesService, JwtStrategy, ChatGateway],
  exports: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
