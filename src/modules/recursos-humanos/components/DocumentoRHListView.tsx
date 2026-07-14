'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosRH } from '../hooks/useDocumentosRH'
import { RecursoDocumentoRH } from '../types'

interface Props {
  recurso: RecursoDocumentoRH
}

export default function DocumentoRHListView({ recurso }: Props) {
  const resource = useDocumentosRH(recurso)

  return <DocumentoGenericoListPanel {...resource} />
}
