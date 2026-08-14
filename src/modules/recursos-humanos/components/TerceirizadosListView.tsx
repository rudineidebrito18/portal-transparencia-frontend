'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useTerceirizados } from '../hooks/useTerceirizados'

export default function TerceirizadosListView() {
  const resource = useTerceirizados()
  const origem = { label: 'Terceirizados', href: '/terceirizados' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
