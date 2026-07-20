export type BankDeposit = {
  id: string;
  userId: string;
  name: string;
  currency: string;
  amountCents: number;
  interestRate: string;
  openedAt: string;
  periodMonths: number;
};

export type CreateBankDeposit = {
  name: string;
  currency: string;
  amountCents: number;
  interestRate: string;
  openedAt: Date;
  periodMonths: number;
};
