import { TipoEmenda, FormaRepasseEmenda } from '@/modules/emendas-parlamentares/enums'

export interface EmendaParlamentar {
  id: number
  numero: string
  dataPublicacao: string
  objeto: string
  autoridade: string
  origem: string
  tipo: TipoEmenda
  formaRepasse: FormaRepasseEmenda
  valorPrevisto: number
  valorRepassado: number
  linkDetalhes: string
}

export type EmendaParlamentarRequest = Omit<EmendaParlamentar, 'id'>

// Backend filtra por tipo OU por ano (endpoints separados /tipo/{tipo} e /ano/{ano}),
// sem combinação — mesma regra do módulo público (emendas-parlamentares/types.ts).
export interface FiltroEmendaParlamentar {
  tipo?: TipoEmenda
  ano?: number
}
