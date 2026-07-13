'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useRenunciaFiscal } from '../hooks/useRenunciaFiscal'

export default function RenunciaFiscalListView() {
  const resource = useRenunciaFiscal()

  return <DocumentoGenericoListPanel {...resource} />
}
