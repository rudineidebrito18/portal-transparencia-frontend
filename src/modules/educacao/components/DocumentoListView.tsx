'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosEducacao } from '../hooks/useDocumentosEducacao'
import { RecursoEducacao } from '../types'

interface Props {
  recurso: RecursoEducacao
}

export default function DocumentoListView({ recurso }: Props) {
  const resource = useDocumentosEducacao(recurso)
  const origem = { label: 'Educação', href: `/educacao?categoria=${recurso}` }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
