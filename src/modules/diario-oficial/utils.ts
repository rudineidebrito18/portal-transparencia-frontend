// Reconstrói os termos individuais a partir da string de busca salva na URL (?termo=...) —
// frases entram entre aspas e viram um único termo, palavras soltas cada uma o seu. Usado tanto
// pra hidratar os chips do filtro (EdicaoDiarioFiltro) quanto pra exibir cada termo separado no
// resumo de resultados (DiarioOficialListView).
export function extrairTermos(valor?: string): string[] {
  if (!valor) return []
  const tokens = valor.match(/"[^"]+"|\S+/g) ?? []
  return tokens.map(t => t.replace(/^"|"$/g, ''))
}

// Cada termo vira uma cláusula: frase (com espaço) entra entre aspas pro Meilisearch tratar
// como sequência exata; palavra solta entra como está (casa em qualquer lugar do conteúdo).
export function montarTermo(termos: string[]): string | undefined {
  if (termos.length === 0) return undefined
  return termos.map(t => (t.includes(' ') ? `"${t}"` : t)).join(' ')
}
