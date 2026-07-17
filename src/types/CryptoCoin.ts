export type GetCryptoCoinsRes = {
  coins: CryptoCoin[];
};

export type CryptoCoin = {
  coinId: string;
  symbol: string;
};
