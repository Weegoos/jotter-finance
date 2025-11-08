export interface IAccount {
  userId: number;
  name: string;
  balance?: number;
  currency: string;
  type: string;
  active?: boolean;
}
