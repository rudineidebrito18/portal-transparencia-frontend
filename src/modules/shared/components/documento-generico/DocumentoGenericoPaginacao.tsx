'use client'

import Pagination from '@/components/ui/Pagination'
import { useDocumentoGenericoUrlState } from '../../hooks/useDocumentoGenericoUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao?: string
}

export default function DocumentoGenericoPaginacao({ totalPaginas, ordenacaoPadrao = 'data,desc' }: Props) {
  const { pagina, setPagina } = useDocumentoGenericoUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
}
