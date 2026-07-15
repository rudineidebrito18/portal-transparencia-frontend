import axios from "axios";

import { lerTokenCookie, limparTokenCookie } from "@/modules/auth/cookie";
import { parseApiError } from "./apiError";

export type { ApiError } from "./apiError";

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

// Anexa o token do painel admin quando presente — inofensivo pras chamadas
// públicas do site (GET sem token continua funcionando normalmente).
api.interceptors.request.use((config) => {
  const token = lerTokenCookie();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = parseApiError(error);

    // Só desloga automaticamente em 401 (token ausente/inválido/expirado) — um
    // 403 aqui costuma ser permissão insuficiente pro papel do usuário (ex:
    // MANAGER tentando excluir algo admin-only), que a UI deve mostrar como
    // mensagem, não como sessão expirada (seção 1/5 do prompt do admin; e a
    // própria detecção de papel em auth.service.ts depende de um 403 "normal"
    // aqui, sem forçar logout).
    if (apiError.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      limparTokenCookie();
      window.location.href = "/admin/login";
    }

    return Promise.reject(apiError);
  }
);