'use client'

import { MdSwapVert } from 'react-icons/md'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { formatarDataHora } from '@/utils/date'
import { useEmpresasDividaAtiva } from '../hooks/useGestaoFiscal'
import EmpresaDividaAtivaCard from './EmpresaDividaAtivaCard'
import EmpresaDividaAtivaFiltro from './EmpresaDividaAtivaFiltro'

export default function EmpresasDividaAtivaListView() {
  const {
    data, loading, erro, pagina, totalPaginas, totalElements, atualizadoEm, setPagina, filtros, setFiltros, ordenacao, setOrdenacao
  } = useEmpresasDividaAtiva()

  return (
    <div>
      <EmpresaDividaAtivaFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm mb-6">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> empresas encontradas
          {atualizadoEm && (
            <span className="text-text-secondary/60"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
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
            <option value="valor,desc">Maior valor</option>
            <option value="valor,asc">Menor valor</option>
          </Select>
        </div>
      </div>

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhuma empresa inscrita em dívida ativa encontrada."
        renderItem={empresa => <EmpresaDividaAtivaCard key={empresa.id} empresa={empresa} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
