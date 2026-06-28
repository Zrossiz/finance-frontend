import { apiClient, refreshClient } from '@/api/client';

export const registrationUserQuery = async (username: string, password: string) => {
  return await apiClient.post('/users/registration', {
    username,
    password,
  });
};

export const loginUserQuery = async (username: string, password: string) => {
  return await apiClient.post('/users/login', {
    username,
    password,
  });
};

export const refreshTokensQuery = async () => {
  return await refreshClient.put('/users/refresh');
};
