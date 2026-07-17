import { apiClient } from './client';

export const getUserCryptoPositions = async () => {
  return apiClient.get('/cryptos');
};

export const deleteCryptoPosition = async (id: string) => {
  return apiClient.delete(`/cryptos/${id}`);
};

export const createCryptoPosition = async (
  ticker: string,
  amount: string,
  coinId: string,
  avgPriceUSDCents?: number,
) => {
  return apiClient.post('/cryptos', {
    ticker,
    amount,
    coin_id: coinId,
    avg_price_usd_cents: avgPriceUSDCents,
  });
};

export const updateCryptoPosition = async (
  id: string,
  amount: string,
  avgPriceUSDCents: number | null,
) => {
  return apiClient.put(`/cryptos/${id}`, {
    amount,
    avg_price_usd_cents: avgPriceUSDCents,
  });
};
