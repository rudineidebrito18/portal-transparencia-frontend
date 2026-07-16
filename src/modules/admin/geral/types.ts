export interface Fornecedor {
  id: number
  nome: string
  cnpj: string
}

export interface FornecedorRequest {
  nome: string
  cnpj: string
}

// Base do futuro módulo público "Secretarias" (fase 1: dados institucionais + gestor
// atual). Backend mudou o contrato em 2026-07-16 — ver prompt-frontend-dashboard-admin.md.
export interface Unidade {
  id: number
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
  gestorFotoCaminho: string
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
}
