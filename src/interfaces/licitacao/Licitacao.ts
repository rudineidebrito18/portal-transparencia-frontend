import { StatusLicitacao } from "../enums/StatusLicitacao"
import { TipoProcedimentoLicitacao } from "../enums/TipoProcedimentoLicitacao"
import { ContratoLicitacao } from "./ContratoLicitacao"
import { DocumentoLicitacao } from "./DocumentoLicitacao"

export interface Licitacao {
  id: number

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

  tipoProcedimento: string
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
  contratos?: ContratoLicitacao[]
}

export interface FiltroLicitacao {
  [key: string]: unknown

  numeroInstrumento?: string
  numeroProcesso?: string
  objeto?: string
  ano?: number
  tipo?: TipoProcedimentoLicitacao | string
  status?: StatusLicitacao | string
  nomeAutoridade?: string
  unidade?: string
  covid?: boolean

  dataInicio?: string
  dataFim?: string
  dataPublicacaoInicio?: string
  dataPublicacaoFim?: string

  busca?: string
}