import { DocumentoGenerico, FiltroDocumentoGenerico } from '@/modules/shared/types/DocumentoGenerico'

export interface ConvenioDocumento extends DocumentoGenerico {
  dataInicio: string
  dataFim: string
}

export type FiltroConvenio = FiltroDocumentoGenerico

// Abas da página /convenios (ver ConveniosView.tsx) — extraído pra types.ts porque mais de um
// arquivo (Server Component + client de abas) precisa do tipo.
export type Aba = 'transferencias-recebidas' | 'transferencias-realizadas' | 'acordos-firmados'
