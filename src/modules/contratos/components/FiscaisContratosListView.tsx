'use client'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { formatarDataHora } from '@/utils/date'
import { useFiscaisContratos } from '../hooks/useFiscaisContratos'
import FiscalContratoCard from './FiscalContratoCard'
import FiscalContratoFiltro from './FiscalContratoFiltro'

export default function FiscaisContratosListView() {
  const {
    data: contratos,
    loading,
    erro,
    pagina,
    totalPaginas,
    totalElements,
    atualizadoEm,
    setPagina,
    filtros,
    setFiltros
  } = useFiscaisContratos()

  return (
    <div className="space-y-6">

      <FiscalContratoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <div className="bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> contratos encontrados
          {atualizadoEm && (
            <span className="text-text-secondary/60"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>
      </div>

      {erro && <ErrorState message={erro} />}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {contratos.length > 0 ? (
              contratos.map(contrato => (
                <FiscalContratoCard key={contrato.id} contrato={contrato} />
              ))
            ) : (
              <EmptyState message="Nenhum contrato encontrado com os filtros aplicados." />
            )}
          </div>

          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}
    </div>
  )
}
