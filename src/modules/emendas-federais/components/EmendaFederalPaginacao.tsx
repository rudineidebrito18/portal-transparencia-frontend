'use client'

import Pagination from '@/components/ui/Pagination'
import { useEmendaFederalUrlState } from '../hooks/useEmendaFederalUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao?: string
}

export default function EmendaFederalPaginacao({ totalPaginas, ordenacaoPadrao = 'atualizadoEm,desc' }: Props) {
  const { pagina, setPagina } = useEmendaFederalUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
}
