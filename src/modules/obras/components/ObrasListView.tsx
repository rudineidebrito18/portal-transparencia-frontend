'use client'

import { MdSwapVert } from 'react-icons/md'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import { formatarDataHora } from '@/utils/date'
import { useObras } from '../hooks/useObras'
import ObraCard from './ObraCard'
import ObraFiltro from './ObraFiltro'

export default function ObrasListView() {
  const {
    data, loading, erro, pagina, totalPaginas, totalElements, atualizadoEm, setPagina, filtros, setFiltros, ordenacao, setOrdenacao
  } = useObras()

  return (
    <div>
      <ObraFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm mb-6">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> obras encontradas
          {atualizadoEm && (
            <span className="text-text-secondary/50"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <select
            value={ordenacao || 'numero,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="dataInicio,desc">Mais recentes</option>
            <option value="dataInicio,asc">Mais antigas</option>
            <option value="valorTotal,desc">Maior valor</option>
            <option value="valorTotal,asc">Menor valor</option>
          </select>
        </div>
      </div>

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage={filtros.paralisada ? 'Nenhuma obra paralisada encontrada.' : 'Nenhuma obra encontrada.'}
        renderItem={obra => <ObraCard key={obra.id} obra={obra} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
