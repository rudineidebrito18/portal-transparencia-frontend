'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useEstagiarios } from '../hooks/useEstagiarios'

export default function EstagiariosListView() {
  const resource = useEstagiarios()
  const origem = { label: 'Estagiários', href: '/estagiarios' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
