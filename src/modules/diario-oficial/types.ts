export interface EdicaoDiario {
  id: number
  numeroEdicao: number
  dataPublicacao: string
  tipo: string
  pathFile: string
  hash: string
}

export interface FiltroEdicaoDiario {
  tipo?: string
  numeroEdicao?: number
  dataInicial?: string
  dataFinal?: string
}
