import { Transactions } from '../transaction.model';

export interface PaginatedTransaction {
  data: Transactions[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
