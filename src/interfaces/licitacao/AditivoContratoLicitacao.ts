import { Fornecedor } from "../geral/Fornecedor"

export interface AditivoContratoLicitacao {
  id: number
  dataAssinatura: string
  objeto: string
  valor: number
  caminhoPdf: string

  fornecedor?: Fornecedor
}