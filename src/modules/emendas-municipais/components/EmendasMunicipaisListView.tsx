'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useEmendasMunicipais } from '../hooks/useEmendasMunicipais'

export default function EmendasMunicipaisListView() {
  const resource = useEmendasMunicipais()
  const origem = { label: 'Emendas Municipais', href: '/emendas-municipais' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
