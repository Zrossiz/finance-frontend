import type { CreateBankDeposit } from '@/types';
import { apiClient } from './client';

export const getBankDeposits = async () => {
  return apiClient.get('/bank-deposit');
};

export const createBankDeposit = async (body: CreateBankDeposit) => {
  return apiClient.post('/bank-deposit', {
    name: body.name,
    currency: body.currency,
    amount_cents: body.amountCents,
    interest_rate: body.interestRate,
    opened_at: body.openedAt,
    period_months: body.periodMonths,
  });
};

export const deleteBankDeposit = async (id: string) => {
  return apiClient.delete(`/bank-deposit/${id}`);
};
