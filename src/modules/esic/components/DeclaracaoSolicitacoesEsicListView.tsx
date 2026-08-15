'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDeclaracaoSolicitacoesEsic } from '../hooks/useDeclaracaoSolicitacoesEsic'

export default function DeclaracaoSolicitacoesEsicListView() {
  const resource = useDeclaracaoSolicitacoesEsic()
  const origem = { label: 'E-SIC', href: '/esic' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
