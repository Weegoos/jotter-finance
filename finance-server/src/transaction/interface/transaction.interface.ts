import { TransactionType } from '../transaction.model';

export interface ITransaction {
  userId: number;
  accountId: number;
  categoryId?: number;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  repeat_rule?: string;
}
