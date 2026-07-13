export enum TipoViagem {
  NACIONAL = 'NACIONAL',
  INTERNACIONAL = 'INTERNACIONAL'
}

export const TipoViagemDescricao: Record<TipoViagem, string> = {
  [TipoViagem.NACIONAL]: 'Nacional',
  [TipoViagem.INTERNACIONAL]: 'Internacional'
}

export interface TabelaValores {
  id: number
  tipo: TipoViagem
  descricao: string
  data: string
  caminhoArquivo: string
}

export interface FiltroTabelaValores {
  descricao?: string
  tipoViagem?: TipoViagem
  dataInicial?: string
  dataFinal?: string
}
