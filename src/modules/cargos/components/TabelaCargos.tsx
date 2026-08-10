'use client'

import { MdGroups, MdPayments, MdSwapVert } from 'react-icons/md'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { formatarDataHora } from '@/utils/date'
import { formatarMoeda } from '@/utils/currency'
import { useCargos } from '../hooks/useCargos'
import CargoFiltro from './CargoFiltro'

export default function TabelaCargos() {
  const {
    data: cargos,
    loading,
    erro,
    pagina,
    totalPaginas,
    totalElements,
    atualizadoEm,
    setPagina,
    filtros,
    setFiltros,
    setOrdenacao,
    ordenacao
  } = useCargos()

  const totalServidores = cargos.reduce((soma, c) => soma + c.quantidade, 0)
  const totalFolhaLiquida = cargos.reduce((soma, c) => soma + c.valorLiquido, 0)

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <CargoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> cargos encontrados
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
            value={ordenacao || 'cargo,asc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="cargo,asc">Cargo (A-Z)</option>
            <option value="cargo,desc">Cargo (Z-A)</option>
            <option value="valorBruto,desc">Maior valor bruto</option>
            <option value="valorBruto,asc">Menor valor bruto</option>
          </Select>
        </div>

      </div>

      {/* ERRO */}
      {erro && <ErrorState message={erro} />}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : cargos.length === 0 && !erro ? (
        <EmptyState message="Nenhum cargo encontrado com os filtros aplicados." />
      ) : (
        <>
          {/* RESUMO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card hoverable={false} className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <MdGroups size={22} />
              </div>
              <div>
                <p className="text-xs uppercase text-text-muted">Servidores nesta página</p>
                <p className="text-xl font-bold text-primary">{totalServidores}</p>
              </div>
            </Card>

            <Card hoverable={false} className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <MdPayments size={22} />
              </div>
              <div>
                <p className="text-xs uppercase text-text-muted">Total líquido nesta página</p>
                <p className="text-xl font-bold text-accent">{formatarMoeda(totalFolhaLiquida)}</p>
              </div>
            </Card>
          </div>

          {/* TABELA */}
          <div className="overflow-x-auto rounded-xl border border-border/30 shadow-sm">
            <table className="w-full text-sm bg-white">
              <thead>
                <tr className="bg-neutral-light/60 text-text-muted text-xs uppercase">
                  <th className="text-left px-4 py-3 font-semibold">Cargo</th>
                  <th className="text-right px-4 py-3 font-semibold">Quantidade</th>
                  <th className="text-right px-4 py-3 font-semibold">Valor Bruto</th>
                  <th className="text-right px-4 py-3 font-semibold">Descontos</th>
                  <th className="text-right px-4 py-3 font-semibold">Valor Líquido</th>
                  <th className="text-right px-4 py-3 font-semibold">Média por Servidor</th>
                </tr>
              </thead>
              <tbody>
                {cargos.map(cargo => (
                  <tr key={cargo.id} className="border-t border-border/20">
                    <td className="px-4 py-3 font-semibold text-text-secondary">{cargo.cargo}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">{cargo.quantidade}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {formatarMoeda(cargo.valorBruto)}
                    </td>
                    <td className="px-4 py-3 text-right text-error">
                      -{formatarMoeda(cargo.valorDesconto)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-accent">
                      {formatarMoeda(cargo.valorLiquido)}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {formatarMoeda(cargo.media)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}
    </div>
  )
}
