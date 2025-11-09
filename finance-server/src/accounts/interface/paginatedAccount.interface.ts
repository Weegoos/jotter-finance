import { Account } from '../account.model';

export interface PaginatedAccounts {
  data: Account[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
