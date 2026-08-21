'use client'

import Pagination from '@/components/ui/Pagination'
import { useObraUrlState } from '../hooks/useObraUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao?: string
}

export default function ObraPaginacao({ totalPaginas, ordenacaoPadrao = 'numero,desc' }: Props) {
  const { pagina, setPagina } = useObraUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
}
