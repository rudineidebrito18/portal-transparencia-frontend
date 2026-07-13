export interface DocumentoGenerico {
  id: number
  data: string
  descricao: string
  caminhoArquivo: string
}

export interface FiltroDocumentoGenerico {
  descricao?: string
  dataInicial?: string
  dataFinal?: string
}
