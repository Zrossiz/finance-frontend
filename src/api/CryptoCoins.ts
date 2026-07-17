import type { GetCryptoCoinsRes } from '@/types';
import { apiClient } from './client';

export const getCryptoCoins = async () => {
  return await apiClient.get<GetCryptoCoinsRes>('/crypto-coins');
};
