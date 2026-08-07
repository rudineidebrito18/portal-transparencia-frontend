import { ConteudoInstitucional, ImagemNoticia } from './types'

export function imagemPrincipal(item: ConteudoInstitucional): string | null {
  return item.imagens?.find(i => i.principal)?.url ?? item.imagens?.[0]?.url ?? null
}

// Todas as imagens do item, com a principal sempre na frente — usado pelo carrossel
// (card e página de detalhe).
export function imagensOrdenadas(item: ConteudoInstitucional): ImagemNoticia[] {
  return [...(item.imagens ?? [])].sort((a, b) => Number(b.principal) - Number(a.principal))
}
