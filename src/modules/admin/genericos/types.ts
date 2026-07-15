// Os dois formatos do "padrão genérico" (seção 6.7 do prompt-frontend-dashboard-admin.md).
export interface DocumentoGenericoAdmin {
  id: number
  descricao: string
  data: string
  caminhoArquivo: string
}

export interface DocumentoGenericoComIntervaloAdmin extends DocumentoGenericoAdmin {
  dataInicio: string
  dataFim: string
}

export interface DocumentoGenericoRequest {
  descricao: string
  data: string
  dataInicio?: string
  dataFim?: string
}

export interface FiltroDocumentoGenericoAdmin {
  descricao?: string
  dataInicial?: string
  dataFinal?: string
}
