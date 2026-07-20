import type { CreateRealEstate, UpdateRealEstate } from '@/types';
import { apiClient } from './client';

export const getUserRealEstates = () => {
  return apiClient.get('/real-estates');
};

export const createRealEstate = (payload: CreateRealEstate) => {
  return apiClient.post('/real-estates', {
    name: payload.name,
    currency: payload.currency,
    purchase_price_cents: payload.purchasePriceCents,
    monthly_income_cents: payload.monthlyIncomeCents,
    purchased: payload.purchased,
  });
};

export const deleteRealEstate = (id: string) => {
  return apiClient.delete(`/real-estates/${id}`);
};

export const updateRealEstate = (id: string, payload: UpdateRealEstate) => {
  return apiClient.post(`/real-estates/${id}`, {
    name: payload.name,
    currency: payload.currency,
    purchase_price_cents: payload.purchasePriceCents,
    monthly_income_cents: payload.monthlyIncomeCents,
    purchased: payload.purchased,
  });
};
