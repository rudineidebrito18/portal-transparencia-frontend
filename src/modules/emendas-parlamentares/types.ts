export interface EmendaParlamentar {
  id: number
  numero: string
  dataPublicacao: string
  objeto: string
  autoridade: string
  origem: string
  tipo: string
  formaRepasse: string
  valorPrevisto: number
  valorRepassado: number
  linkDetalhes?: string
}

// O backend filtra por tipo OU por ano (endpoints separados /tipo/{tipo} e /ano/{ano}),
// não há combinação dos dois num único endpoint — ver emendaParlamentar.service.ts.
export interface FiltroEmendaParlamentar {
  tipo?: string
  ano?: number
}
