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
}
