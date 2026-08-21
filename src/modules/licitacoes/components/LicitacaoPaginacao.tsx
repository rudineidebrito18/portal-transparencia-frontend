'use client'

import Pagination from '@/components/ui/Pagination'
import { useLicitacaoUrlState } from '../hooks/useLicitacaoUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao?: string
}

export default function LicitacaoPaginacao({ totalPaginas, ordenacaoPadrao = 'dataPublicacao,desc' }: Props) {
  const { pagina, setPagina } = useLicitacaoUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
}
