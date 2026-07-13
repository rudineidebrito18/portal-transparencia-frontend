import { DocumentoGenerico, FiltroDocumentoGenerico } from '@/modules/shared/types/DocumentoGenerico'

export interface ConvenioDocumento extends DocumentoGenerico {
  dataInicio: string
  dataFim: string
}

export type FiltroConvenio = FiltroDocumentoGenerico
