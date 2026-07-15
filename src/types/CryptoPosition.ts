export type CryptoPosition = {
  id: string;
  userId: string;
  ticker: string;
  amount: string;
  avgPriceUsdCents: number | null;
  totalPriceUsd: number;
  profit: number;
};

export type GetUserCryptoPositionsRes = {
  total: string;
  totalProfit: string;
  positions: CryptoPosition[];
};
