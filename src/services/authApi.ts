import axios from "axios";

import { parseApiError } from "./apiError";

// Login vive em /users/login, fora do prefixo /api usado por api.ts — mesma
// estratégia (rewrite pra evitar CORS no navegador, URL direta no servidor),
// prefixo diferente. Ver rewrite de /users/* em next.config.ts.
const baseURL = typeof window === "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "")
  : "";

export const authApi = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(parseApiError(error))
);
