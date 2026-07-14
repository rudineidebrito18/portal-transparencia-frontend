'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useFiscalContrato } from '../hooks/useFiscalContrato'

export default function FiscalContratoListView() {
  const resource = useFiscalContrato()

  return <DocumentoGenericoListPanel {...resource} />
}
