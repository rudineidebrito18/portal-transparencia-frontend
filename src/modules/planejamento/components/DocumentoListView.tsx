'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPlanejamento } from '../hooks/useDocumentosPlanejamento'
import { RecursoPlanejamento } from '../types'

interface Props {
  recurso: RecursoPlanejamento
}

export default function DocumentoListView({ recurso }: Props) {
  const resource = useDocumentosPlanejamento(recurso)

  return <DocumentoGenericoListPanel {...resource} />
}
