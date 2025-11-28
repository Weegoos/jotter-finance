export interface IAccount {
  name: string;
  userId: number;
  balance?: number;
  currency: string;
  type: string;
  bankId: number;
  active?: boolean;
}
