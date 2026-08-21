'use client'

import Pagination from '@/components/ui/Pagination'
import { useConteudoInstitucionalUrlState } from '../hooks/useConteudoInstitucionalUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao?: string
}

export default function ConteudoInstitucionalPaginacao({ totalPaginas, ordenacaoPadrao = 'data,desc' }: Props) {
  const { pagina, setPagina } = useConteudoInstitucionalUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
}
