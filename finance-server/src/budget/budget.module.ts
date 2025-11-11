import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Categories } from 'src/categories/categories.model';
import { Budget } from './budget.model';
import { BudgetService } from './budget.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ChatGateway } from 'src/chat.gateway';
import { BudgetController } from './budget.controller';

@Module({
  imports: [SequelizeModule.forFeature([Budget, Categories])],
  providers: [BudgetService, JwtStrategy, ChatGateway],
  exports: [BudgetService],
  controllers: [BudgetController],
})
export class BudgetModule {}
