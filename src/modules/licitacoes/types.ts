export interface LicitacaoResumo {
  id: number
  numeroInstrumento: string
  ano: number
  dataAbertura: string
  tipo: string
  statusDescricao: string
  valorTotalDespesa?: number
  unidade?: string
  objeto: string
}

export interface DocumentoLicitacao {
  assunto: string
  tipoDocumento: string
  dataEnvio: string
  caminhoPdf: string
}

export interface LicitacaoDetalhe {
  numeroInstrumento: string
  ano: number
  numeroProcesso: string
  dataPublicacao: string
  dataSessao: string
  dataAbertura: string
  dataHomologacao?: string
  valorEstimado?: number
  valorAdjudicado?: number
  valorDotacao?: number
  tipoProcedimentoLicitacao: string
  status: string
  tipoCriterio?: string
  regimeExecucao?: string
  finalidade?: string
  tipoResultado?: string
  naturezaDespesa?: string
  origemRecurso?: string
  unidade?: string
  nomeAutoridade?: string
  sistemaEletronico?: string
  lei?: string
  covid: boolean
  objeto: string
  documentos?: DocumentoLicitacao[]
}

export interface FiltroLicitacao {
  numeroInstrumento?: string
  numeroProcesso?: string
  ano?: number
  tipo?: string
  nomeAutoridade?: string
  status?: string
  unidade?: string
  covid?: boolean
  dataAberturaInicio?: string
  dataAberturaFim?: string
  dataPublicacaoInicio?: string
  dataPublicacaoFim?: string
}
