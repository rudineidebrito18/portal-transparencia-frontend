export type TipoViagem = 'NACIONAL' | 'INTERNACIONAL'

export interface TabelaValores {
  id: number
  tipo: TipoViagem
  descricao: string
  data: string
  caminhoArquivo: string
}

export interface TabelaValoresRequest {
  tipo: TipoViagem
  descricao: string
  data: string
}

export interface FiltroTabelaValores {
  descricao?: string
  tipoViagem?: TipoViagem
  dataInicial?: string
  dataFinal?: string
}
