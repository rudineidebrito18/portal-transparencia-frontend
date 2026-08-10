'use client'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { formatarDataHora } from '@/utils/date'
import { useAditivosGlobal } from '../hooks/useAditivosGlobal'
import AditivoGlobalCard from './AditivoGlobalCard'

// Sem filtro dedicado de propósito — o backend só aceita paginação/ordenação nesse
// endpoint quando chamado sem contratoLicitacaoId (confirmado via OpenAPI), então não
// tem o que filtrar aqui além da paginação que já vem de série.
export default function AditivosGlobalListView() {
  const { data: aditivos, loading, erro, pagina, totalPaginas, totalElements, atualizadoEm, setPagina } = useAditivosGlobal()

  return (
    <div className="space-y-6">

      <div className="bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> aditivos encontrados
          {atualizadoEm && (
            <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
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
            {aditivos.length > 0 ? (
              aditivos.map(aditivo => (
                <AditivoGlobalCard key={aditivo.id} aditivo={aditivo} />
              ))
            ) : (
              <EmptyState message="Nenhum aditivo encontrado." />
            )}
          </div>

          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}
    </div>
  )
}
