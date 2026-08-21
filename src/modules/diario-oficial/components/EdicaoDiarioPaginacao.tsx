'use client'

import Pagination from '@/components/ui/Pagination'
import { useEdicaoDiarioUrlState } from '../hooks/useEdicaoDiarioUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao?: string
}

export default function EdicaoDiarioPaginacao({ totalPaginas, ordenacaoPadrao = 'dataPublicacao,desc' }: Props) {
  const { pagina, setPagina } = useEdicaoDiarioUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
}
