'use client'

import { MdSwapVert } from 'react-icons/md'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { formatarDataHora } from '@/utils/date'
import { useEmpresasInidoneas } from '../hooks/useGestaoFiscal'
import EmpresaInidoneaCard from './EmpresaInidoneaCard'
import EmpresaInidoneaFiltro from './EmpresaInidoneaFiltro'

export default function EmpresasInidoneasListView() {
  const {
    data, loading, erro, pagina, totalPaginas, totalElements, atualizadoEm, setPagina, filtros, setFiltros, ordenacao, setOrdenacao
  } = useEmpresasInidoneas()

  return (
    <div>
      <EmpresaInidoneaFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm mb-6">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> empresas encontradas
          {atualizadoEm && (
            <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <Select
            value={ordenacao || 'data,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="data,desc">Mais recentes</option>
            <option value="data,asc">Mais antigas</option>
          </Select>
        </div>
      </div>

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhuma empresa inidônea ou suspensa encontrada."
        renderItem={empresa => <EmpresaInidoneaCard key={empresa.id} empresa={empresa} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
