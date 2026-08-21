'use client'

import Pagination from '@/components/ui/Pagination'
import { useServidorUrlState } from '../hooks/useServidorUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao?: string
}

export default function ServidorPaginacao({ totalPaginas, ordenacaoPadrao = 'name,asc' }: Props) {
  const { pagina, setPagina } = useServidorUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
}
