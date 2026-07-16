export interface Fornecedor {
  id: number
  nome: string
  cnpj: string
}

export interface FornecedorRequest {
  nome: string
  cnpj: string
}

export interface Unidade {
  id: number
  nome: string
}

export interface UnidadeRequest {
  nome: string
}
