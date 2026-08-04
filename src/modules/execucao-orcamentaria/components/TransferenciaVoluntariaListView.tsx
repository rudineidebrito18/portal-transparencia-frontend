'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useTransferenciaVoluntaria } from '../hooks/useTransferenciaVoluntaria'

export default function TransferenciaVoluntariaListView() {
  const resource = useTransferenciaVoluntaria()

  return <DocumentoGenericoListPanel {...resource} />
}
