'use client'

import Pagination from '@/components/ui/Pagination'
import { useEmendaEstadualUrlState } from '../hooks/useEmendaEstadualUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao?: string
}

export default function EmendaEstadualPaginacao({ totalPaginas, ordenacaoPadrao = 'atualizadoEm,desc' }: Props) {
  const { pagina, setPagina } = useEmendaEstadualUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
}
