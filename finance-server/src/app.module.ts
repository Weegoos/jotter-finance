import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { Budget } from './budget/budget.model';
import { Account } from './accounts/account.model';
import { AccountModule } from './accounts/account.module'; // модуль — отдельно
import { CategoriesModule } from './categories/categories.module';
import { Categories } from './categories/categories.model';
import { AppService } from './app.service';
import { ChatGateway } from './chat.gateway';
import { Transactions } from './transaction/transaction.model';
import { TransactionModule } from './transaction/transaction.module';
import { Stats } from './stats/stats.module';
import { BudgetModule } from './budget/budget.module';
import { BankModule } from './banks/bank.module';
import { Bank } from './banks/bank.model';
import { AIModule } from './ai/ai.module';
import { PromoCodes } from './promo_codes/promoCodes.model';
import { PromoCodesModule } from './promo_codes/promoCodes.module';
import { AIConversationModule } from './ai_conversation/ai_conversation.module';
import { AIConversation } from './ai_conversation/ai_conversation.model';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): SequelizeModuleOptions => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        models: [
          Budget,
          Account,
          Categories,
          Transactions,
          Bank,
          PromoCodes,
          AIConversation,
        ] as const,
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
    CategoriesModule,
    TransactionModule,
    BudgetModule,
    AccountModule,
    Stats,
    BankModule,
    AIModule,
    PromoCodesModule,
    AIConversationModule,
  ],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
