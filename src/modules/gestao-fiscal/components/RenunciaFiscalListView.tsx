'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useRenunciaFiscal } from '../hooks/useRenunciaFiscal'

export default function RenunciaFiscalListView() {
  const resource = useRenunciaFiscal()
  const origem = { label: 'Gestão Fiscal', href: '/gestao-fiscal?categoria=renuncia-fiscal' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
