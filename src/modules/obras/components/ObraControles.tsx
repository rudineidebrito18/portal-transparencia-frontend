'use client'

import { MdSwapVert } from 'react-icons/md'

import Select from '@/components/ui/Select'
import { formatarDataHora } from '@/utils/date'
import { useObraUrlState } from '../hooks/useObraUrlState'
import ObraFiltro from './ObraFiltro'

interface Props {
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
}

// Sem exportar — ObrasListView original nunca teve ModalExportar, diferente da maioria dos
// outros módulos bespoke da Fase 4.
export default function ObraControles({
  totalElements,
  atualizadoEm,
  ordenacaoPadrao = 'numero,desc'
}: Props) {
  const { ordenacao, filtros, setOrdenacao, setFiltros } = useObraUrlState(ordenacaoPadrao)

  return (
    <>
      <ObraFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm mb-6">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> obras encontradas
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
            <option value="dataInicio,desc">Mais recentes</option>
            <option value="dataInicio,asc">Mais antigas</option>
            <option value="valorTotal,desc">Maior valor</option>
            <option value="valorTotal,asc">Menor valor</option>
          </Select>
        </div>
      </div>
    </>
  )
}
