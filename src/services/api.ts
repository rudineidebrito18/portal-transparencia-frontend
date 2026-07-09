import axios from "axios";

// No navegador, usa caminho relativo (mesma origem do Next.js) para evitar CORS —
// next.config.ts reescreve /api/* pro backend real. No servidor (SSR/Server Components),
// chama o backend diretamente, já que não há política de CORS entre servidores.
const baseURL = typeof window === "undefined"
  ? process.env.NEXT_PUBLIC_API_URL
  : "/api";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

export interface ApiError extends Error {
  status?: number;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Erro inesperado";

    console.error("API ERROR:", message);

    const apiError: ApiError = new Error(message);
    apiError.status = error.response?.status;

    return Promise.reject(apiError);
  }
);