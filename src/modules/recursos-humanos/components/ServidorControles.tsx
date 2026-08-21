'use client'

import { MdSwapVert } from 'react-icons/md'

import Select from '@/components/ui/Select'
import { formatarDataHora } from '@/utils/date'
import { useServidorUrlState } from '../hooks/useServidorUrlState'
import ServidorFiltro from './ServidorFiltro'

interface Props {
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
}

// Sem exportar — ServidorListView original nunca teve ModalExportar.
export default function ServidorControles({
  totalElements,
  atualizadoEm,
  ordenacaoPadrao = 'name,asc'
}: Props) {
  const { ordenacao, filtros, setOrdenacao, setFiltros } = useServidorUrlState(ordenacaoPadrao)

  return (
    <>
      <ServidorFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> servidores encontrados
          <span className="text-text-muted"> · atualizado em {formatarDataHora(new Date(atualizadoEm))}</span>
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <Select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="name,asc">Nome (A-Z)</option>
            <option value="name,desc">Nome (Z-A)</option>
          </Select>
        </div>
      </div>
    </>
  )
}
