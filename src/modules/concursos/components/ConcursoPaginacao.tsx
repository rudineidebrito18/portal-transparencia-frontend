'use client'

import Pagination from '@/components/ui/Pagination'
import { useConcursoUrlState } from '../hooks/useConcursoUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao?: string
}

export default function ConcursoPaginacao({ totalPaginas, ordenacaoPadrao = 'dataAbertura,desc' }: Props) {
  const { pagina, setPagina } = useConcursoUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
}
