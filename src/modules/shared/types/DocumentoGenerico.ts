export interface DocumentoGenerico {
  id: number
  data: string
  descricao: string
  caminhoArquivo: string
  // Só presente nos módulos "quase genéricos" que saem do padrão puro pra ganhar um campo
  // estruturado próprio (ex: Parecer Prévio, Julgamento de Contas TCE — padrão V28/item 22
  // do backlog). Ausente/undefined em todos os outros ~20 módulos que reaproveitam este tipo.
  exercicio?: number
}

export interface FiltroDocumentoGenerico {
  descricao?: string
  dataInicial?: string
  dataFinal?: string
  exercicio?: number
}
