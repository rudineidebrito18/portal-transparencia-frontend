'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosSaude } from '../hooks/useDocumentosSaude'
import { RecursoSaude } from '../types'

interface Props {
  recurso: RecursoSaude
}

export default function DocumentoListView({ recurso }: Props) {
  const resource = useDocumentosSaude(recurso)
  const origem = { label: 'Saúde', href: `/saude?categoria=${recurso}` }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
