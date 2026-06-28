export type Bond = {
  id: string;
  userId: string;
  ticker: string;
  currency: string;
  amount: number;
  avgPriceCents: number;
  couponCents: number;
  couponPeriodMonths: number;
};
