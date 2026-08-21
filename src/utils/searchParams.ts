// Server Components no App Router recebem searchParams como objeto plano (chave -> string |
// string[] | undefined), não como URLSearchParams — parse genérico, sem depender de
// next/navigation (que é client-only). Reaproveitado por qualquer módulo que extrai filtros de
// query string no servidor (ver shared/utils/filtroDocumentoGenerico.ts pro caso de
// DocumentoGenerico, NoticiasListView pro caso de ConteudoInstitucional).
export function extrairFiltrosDeSearchParams<T extends object>(
  searchParams: Record<string, string | string[] | undefined>,
  paramsReservados: ReadonlySet<string>
): T {
  const filtros: Record<string, string> = {}

  for (const [chave, valor] of Object.entries(searchParams)) {
    if (paramsReservados.has(chave)) continue
    if (typeof valor === 'string' && valor !== '') filtros[chave] = valor
  }

  return filtros as T
}
