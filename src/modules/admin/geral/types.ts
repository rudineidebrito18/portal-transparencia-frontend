export interface Fornecedor {
  id: number
  nome: string
  cnpj: string
}

export interface FornecedorRequest {
  nome: string
  cnpj: string
}

export interface FiltroFornecedor {
  nome?: string
  cnpj?: string
}

// Tipo canônico de Unidade (e dos 5 sub-recursos) mora no módulo público
// "Secretarias" — mesmo padrão de ObraPublica em modules/obras/types.ts — porque o
// módulo admin de Unidades virou a base dele em 2026-07-16. Reexporta aqui só pra
// não quebrar o import existente em rh/types.ts (Pick<Unidade, 'id' | 'nome'>).
export type {
  Unidade,
  Decreto,
  DocumentoUnidade,
  PessoaCargoUnidade,
  SetorUnidade
} from '@/modules/secretarias/types'
export { TipoDocumentoUnidade, TipoDocumentoUnidadeDescricao } from '@/modules/secretarias/types'

import { TipoDocumentoUnidade } from '@/modules/secretarias/types'

export interface FiltroUnidade {
  nome?: string
  vigencia?: string
}

export interface UnidadeRequest {
  nome: string
  cnpj: string
  telefone: string
  email: string
  horarioAtendimento: string
  endereco: string
  atribuicoes: string
  gestorNome: string
  gestorCargo: string
  gestorVerificado: boolean
  dataInicio?: string
  dataFim?: string
}

export interface DecretoRequest {
  descricao: string
  data: string
}

export interface DocumentoUnidadeRequest {
  tipo: TipoDocumentoUnidade
}

export interface PessoaCargoUnidadeRequest {
  nome: string
  cargo: string
  dataInicio: string
  dataFim: string
}

export interface SetorUnidadeRequest {
  nome: string
  descricao: string
}
