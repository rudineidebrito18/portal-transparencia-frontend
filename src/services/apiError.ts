import { AxiosError } from "axios";

export interface ApiError extends Error {
  status?: number;
}

// Formato padrão de erro do backend (seção 3 do prompt-frontend-dashboard-admin.md):
// { timestamp, code, status, errors: string[] }. Alguns 401/403 do Spring
// Security vêm com corpo vazio — nesse caso cai no fallback.
export function parseApiError(error: AxiosError<{ errors?: string[]; message?: string }>): ApiError {
  const status = error.response?.status;
  const errors = error.response?.data?.errors;
  const message = errors?.join("; ") || error.response?.data?.message || error.message || "Erro inesperado";

  console.error("API ERROR:", message);

  const apiError: ApiError = new Error(message);
  apiError.status = status;

  return apiError;
}
