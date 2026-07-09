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
