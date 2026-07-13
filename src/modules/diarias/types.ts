export interface Diaria {
  id: number
  dataInicio: string
  dataTermino: string
  beneficiario: string
  cargo: string
  destino: string
  motivo: string
  quantDiarias: number
  valorConcedido: number
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
}
