export interface Diaria {
  id: number
  numeroSequencial: number
  dataInicio: string
  dataTermino: string
  beneficiario: string
  cargo: string
  destino: string
  motivo: string
  quantDiarias: number
  valorConcedido: number
  unidadeId?: number
  unidadeNome?: string
}

export interface FiltroDiaria {
  dataInicio?: string
  dataTermino?: string
  beneficiario?: string
  cargo?: string
  destino?: string
  motivo?: string
  quantDiarias?: number
  valorConcedido?: number
  unidadeId?: number
}
