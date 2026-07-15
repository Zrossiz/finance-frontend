import axios from 'axios';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const code = error.response?.data?.code ?? 'UNKNOWN_ERROR';
    const message = error.response?.data?.message ?? 'Something went wrong';

    return new ApiError(status, code, message);
  }

  return new ApiError(0, 'UNKNOWN_ERROR', 'Something went wrong');
}
