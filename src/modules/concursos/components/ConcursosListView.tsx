'use client'

import { MdSwapVert } from 'react-icons/md'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import { formatarDataHora } from '@/utils/date'
import { useConcursos } from '../hooks/useConcursos'
import ConcursoCard from './ConcursoCard'
import ConcursoFiltro from './ConcursoFiltro'

export default function ConcursosListView() {
  const {
    data, loading, erro, pagina, totalPaginas, totalElements, atualizadoEm, setPagina, filtros, setFiltros, ordenacao, setOrdenacao
  } = useConcursos()

  return (
    <div>
      <ConcursoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm mb-6">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> concursos encontrados
          {atualizadoEm && (
            <span className="text-text-secondary/60"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <select
            value={ordenacao || 'dataAbertura,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            className="border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="dataAbertura,desc">Mais recentes</option>
            <option value="dataAbertura,asc">Mais antigos</option>
          </select>
        </div>
      </div>

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhum concurso ou seleção pública encontrado."
        renderItem={concurso => <ConcursoCard key={concurso.id} concurso={concurso} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
