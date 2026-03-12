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
  valorTotalDespesa?: number
  valorDotacao?: number
  valorGlobalAdjudicado?: number

  tipoProcedimento: TipoProcedimentoLicitacao
  status: StatusLicitacao

  tipoCriterio?: string
  finalidade?: string
  naturezaDespesa?: string
  regimeExecucao?: string
  tipoResultado?: string
  origemRecurso?: string
  sistemaEletronico?: string
  lei?: string
  unidade?: string
  nomeAutoridade?: string

  objeto: string

  covid: boolean

  documentos?: DocumentoLicitacao[]
  contratos?: ContratoLicitacao[]
}

export interface FiltroLicitacao {
  tipoProcedimento?: string
  numeroInstrumento?: string
  objeto?: string
  dataInicio?: string
  dataFim?: string
}