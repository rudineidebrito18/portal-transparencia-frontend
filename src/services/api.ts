import axios from "axios";

import { lerTokenCookie, limparTokenCookie } from "@/modules/auth/cookie";
import { parseApiError } from "./apiError";

export type { ApiError } from "./apiError";

// No navegador, usa caminho relativo (mesma origem do Next.js) para evitar CORS — o Route
// Handler catch-all em src/app/api/[...path]/route.ts repassa pro backend real, anexando o
// segredo de gateway (Fase 3) que o navegador nunca vê. No servidor (SSR/Server Components),
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

// Anexa o token do painel admin quando presente — mas só em páginas do /admin. O cookie
// admin_token é do painel: mandá-lo junto nas chamadas das páginas públicas client-side
// (/servidores, /folha-pagamento...) fazia o backend — que decide o mascaramento de CPF por
// requisição, não por endpoint — devolver CPF completo pro público quando o admin estava
// logado (análise 2026-08-18). No servidor (SSR) o token nem existe (cookie é do browser).
api.interceptors.request.use((config) => {
  const noPainel = typeof window === 'undefined' || window.location.pathname.startsWith('/admin')
  const token = noPainel ? lerTokenCookie() : null
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // No servidor (SSR/Server Components), esta instância chama o backend DIRETO (baseURL
  // acima), não passa pelo Route Handler /api/* — que só existe pra anexar o segredo nas
  // chamadas vindas do browser. Sem isso aqui, todo Server Component que usa `api` (ex.:
  // NoticiasDestaque, DiarioOficialDestaque, LicitacoesRecentes na home, noticias/[id])
  // toma 401 do InternalGatewayKeyFilter (Fase 3) — achado real: a home inteira estava
  // mostrando "Chave de gateway interna ausente ou inválida" pro visitante antes desta
  // correção. INTERNAL_GATEWAY_KEY é variável server-only (sem NEXT_PUBLIC_), nunca vai
  // pro bundle do cliente.
  if (typeof window === "undefined") {
    config.headers["X-Internal-Gateway-Key"] = process.env.INTERNAL_GATEWAY_KEY ?? "";
  }

  // Upload de arquivo (multipart/form-data) precisa de mais tempo que os 10s
  // padrão — PDFs/imagens maiores ou uma conexão mais lenta estouram isso fácil
  // ("timeout of 10000ms exceeded"), mesmo problema em qualquer módulo que sobe
  // arquivo (Aditivos, Obras, Notícias etc). Só afeta requisições com FormData —
  // chamadas JSON continuam com o timeout curto de 10s.
  //
  // O "Content-Type": "application/json" lá em cima é o default da instância inteira.
  // Pra FormData isso é errado — precisa ser multipart/form-data com um boundary que só
  // o navegador sabe gerar — mas o axios só substitui automaticamente um Content-Type
  // que ELE PRÓPRIO definiu; um valor vindo do default da instância (como este) não é
  // limpo sozinho. Sem apagar aqui, toda chamada com FormData saía com
  // "Content-Type: application/json" (rejeitado pelo backend) em vez de deixar o
  // navegador montar o header multipart correto.
  //
  // Até a Fase 3 (segredo de gateway), upload ia DIRETO pro backend — o antigo proxy por
  // rewrites() do Next tinha um buffer de ~10MB que truncava arquivo maior silenciosamente.
  // O Route Handler que substituiu o rewrites() faz streaming de verdade (sem buffer
  // intermediário) e foi validado com upload real de 30MB sem truncar — então FormData volta
  // a usar o mesmo "/api" de qualquer outra chamada, sem desvio nenhum.
  if (config.data instanceof FormData) {
    config.timeout = 60000;
    config.headers.delete("Content-Type");
  }

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