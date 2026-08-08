'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useLicitantesSancionados } from '../hooks/useLicitantesSancionados'

export default function LicitantesSancionadosListView() {
  const resource = useLicitantesSancionados()
  const origem = { label: 'Licitantes e/ou Contratados Sancionados', href: '/licitantes-sancionados' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
