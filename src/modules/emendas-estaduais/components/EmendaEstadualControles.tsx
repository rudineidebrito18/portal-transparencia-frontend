'use client'

import { MdSwapVert } from 'react-icons/md'

import Select from '@/components/ui/Select'
import { formatarDataHora } from '@/utils/date'
import { useEmendaEstadualUrlState } from '../hooks/useEmendaEstadualUrlState'
import EmendaEstadualFiltro from './EmendaEstadualFiltro'

interface Props {
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
}

// Sem exportar — EmendaEstadualListView original nunca teve ModalExportar.
export default function EmendaEstadualControles({
  totalElements,
  atualizadoEm,
  ordenacaoPadrao = 'atualizadoEm,desc'
}: Props) {
  const { ordenacao, filtros, setOrdenacao, setFiltros } = useEmendaEstadualUrlState(ordenacaoPadrao)

  return (
    <>
      <EmendaEstadualFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> resultados encontrados
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
            <option value="atualizadoEm,desc">Atualizadas recentemente</option>
            <option value="valorPago,desc">Maior valor pago</option>
            <option value="valorPago,asc">Menor valor pago</option>
          </Select>
        </div>
      </div>
    </>
  )
}
