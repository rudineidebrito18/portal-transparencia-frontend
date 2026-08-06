'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useFiscalContrato } from '../hooks/useFiscalContrato'

export default function FiscalContratoListView() {
  const resource = useFiscalContrato()
  const origem = { label: 'Fiscal de Contrato', href: '/fiscal-contrato' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
