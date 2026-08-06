'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useTransferenciaVoluntaria } from '../hooks/useTransferenciaVoluntaria'

export default function TransferenciaVoluntariaListView() {
  const resource = useTransferenciaVoluntaria()
  const origem = { label: 'Transferências Voluntárias (EC nº 105)', href: '/transferencia-voluntaria' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
