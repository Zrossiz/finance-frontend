export type BankDeposit = {
  id: string;
  userId: string;
  name: string;
  currency: string;
  amountCents: number;
  interestRate: string;
  openedAt: string;
  closedAt: string | null;
};