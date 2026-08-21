'use client'

import Pagination from '@/components/ui/Pagination'
import { useDiariaUrlState } from '../hooks/useDiariaUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao?: string
}

export default function DiariaPaginacao({ totalPaginas, ordenacaoPadrao = 'dataInicio,desc' }: Props) {
  const { pagina, setPagina } = useDiariaUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
}
