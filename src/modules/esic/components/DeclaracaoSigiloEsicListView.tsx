'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDeclaracaoSigiloEsic } from '../hooks/useDeclaracaoSigiloEsic'

export default function DeclaracaoSigiloEsicListView() {
  const resource = useDeclaracaoSigiloEsic()
  const origem = { label: 'E-SIC', href: '/esic' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
