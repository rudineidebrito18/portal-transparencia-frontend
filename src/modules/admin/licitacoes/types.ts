import { Documento } from '@/modules/shared/types/Documento'
import { StatusLicitacao, TipoProcedimentoLicitacao } from '@/modules/licitacoes/enums'

export type { LicitacaoResumo, LicitacaoDetalhe, FiltroLicitacao } from '@/modules/licitacoes/types'
export { StatusLicitacao, StatusLicitacaoDescricao, StatusLicitacaoStyle, TipoProcedimentoLicitacao, TipoProcedimentoDescricao } from '@/modules/licitacoes/enums'
export type { ContratoLicitacao, Aditivo } from '@/modules/contratos/types'
export { normalizarStatus, normalizarTipoProcedimento } from './enumMapping'

export interface LicitacaoRequest {
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
  tipoProcedimentoLicitacao: TipoProcedimentoLicitacao
  status: StatusLicitacao
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
}

export interface DocumentoUploadRequest {
  assunto: string
  tipoDocumento: string
  dataEnvio: string
}

export type { Documento }

export interface ContratoLicitacaoRequest {
  numeroContrato: number
  exercicio: number
  fornecedor: string
  dataAssinatura: string
  dataPublicacao: string
  dataInicio: string
  dataTermino: string
  unidade: string
  gestorContrato: string
  meioPublicacao: string
  valorContrato: number
  status: StatusLicitacao
  objeto: string
}

export interface AditivoRequest {
  dataAssinatura: string
  objeto: string
  fornecedorId: number
  contratoLicitacaoId: number
}
