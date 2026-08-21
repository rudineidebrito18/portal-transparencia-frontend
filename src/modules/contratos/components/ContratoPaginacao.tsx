'use client'

import Pagination from '@/components/ui/Pagination'
import { useContratoUrlState } from '../hooks/useContratoUrlState'

interface Props {
  totalPaginas: number
  ordenacaoPadrao: string
}

// Compartilhado pelos 3 sub-módulos de contratos (Contratos, Aditivos, Fiscais).
export default function ContratoPaginacao({ totalPaginas, ordenacaoPadrao }: Props) {
  const { pagina, setPagina } = useContratoUrlState(ordenacaoPadrao)

  return <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
}
