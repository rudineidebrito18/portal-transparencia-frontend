export type RecursoPrestacaoContas =
  | 'balanco-geral'
  | 'parecer-previo'
  | 'julgamento-contas-tce'
  | 'julgamento-contas-legislativo'
  | 'prestacao-contas-anos-anteriores'

export interface DocumentoPrestacaoContas {
  id: number
  data: string
  descricao: string
  caminhoArquivo: string
}

export interface FiltroDocumentoPrestacaoContas {
  descricao?: string
  dataInicial?: string
  dataFinal?: string
}
