export interface Licitacao {
  id: string
  numero: string
  modalidade: string
  tipo: string
  objeto: string
  dataAbertura: string
  dataSituacao: string
  dataPublicacao: string
  valorEstimado: number
  situacao: string
}

export interface FiltroLicitacao {
  modalidade: string
  numero: string
  objeto: string
  dataInicio: string
  dataFim: string
}
