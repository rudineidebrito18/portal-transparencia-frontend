const NOME_COOKIE = 'admin_token'
// Token JWT expira em 4h no backend (seção 1 do prompt-frontend-dashboard-admin.md).
const MAX_AGE_SEGUNDOS = 60 * 60 * 4

// Cookie não-httpOnly (só dá pra setar via JS do lado do cliente) — o
// middleware.ts só verifica a presença dele por UX (não mostrar a casca do
// admin pra visitante aleatório). A barreira de segurança real é o Spring
// Security no backend em cada request, não este cookie.
export function salvarTokenCookie(token: string) {
  document.cookie = `${NOME_COOKIE}=${token}; path=/; max-age=${MAX_AGE_SEGUNDOS}; samesite=lax`
}

export function lerTokenCookie(): string | null {
  if (typeof document === 'undefined') return null

  const encontrado = document.cookie
    .split('; ')
    .find(linha => linha.startsWith(`${NOME_COOKIE}=`))

  return encontrado ? encontrado.substring(NOME_COOKIE.length + 1) : null
}

export function limparTokenCookie() {
  document.cookie = `${NOME_COOKIE}=; path=/; max-age=0`
}

export { NOME_COOKIE }
