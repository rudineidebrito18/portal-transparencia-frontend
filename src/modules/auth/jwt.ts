interface JwtPayload {
  sub?: string
  [key: string]: unknown
}

// O JWT emitido por /users/login só carrega { iss, iat, exp, sub } — sub é o
// e-mail, não há claim de roles (confirmado inspecionando um token real).
// Por isso o papel do usuário logado não vem do token: ver detectarPapel em
// auth.service.ts, que descobre isso testando o acesso a /api/admin/users.
// Só decodifica pra popular a UI (e-mail) — não valida assinatura; a
// validação real acontece no backend a cada request autenticado.
function decodePayload(token: string): JwtPayload | null {
  const partes = token.split('.')
  if (partes.length !== 3) return null

  try {
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function extrairEmailDoToken(token: string): string {
  return decodePayload(token)?.sub ?? ''
}
