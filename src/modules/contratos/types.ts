export interface Aditivo {
  id: number
  dataAssinatura: string
  objeto: string
  fornecedorId?: number
  fornecedorNome?: string
  fornecedorCnpj?: string
  caminhoPdf: string
  contratoLicitacaoId: number
}

export interface ContratoLicitacao {
  id: number
  numeroSequencial: number
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
  status: string
  objeto: string
  numeroLicitacao: string
  licitacaoId?: number
}

// GET /licitacoes/contratos/filtro (global, sem exigir licitacaoId) — Contrato.unidade é
// String livre sem FK, mas o backend agora resolve unidadeId via os Órgãos da licitação
// de origem do contrato.
export interface FiltroContrato {
  numeroContrato?: number
  exercicio?: number
  fornecedor?: string
  objeto?: string
  status?: string
  unidadeId?: number
  gestorContrato?: string
  dataInicial?: string
  dataFinal?: string
}
