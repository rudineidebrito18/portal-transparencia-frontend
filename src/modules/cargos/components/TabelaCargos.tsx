'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import ModalExportar from '@/components/ui/ModalExportar'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { formatarDataHora } from '@/utils/date'
import { formatarMoeda } from '@/utils/currency'
import { ColunaExportacao } from '@/utils/exportacao'
import { useCargos } from '../hooks/useCargos'
import { Cargo } from '../types'
import CargoFiltro from './CargoFiltro'

const COLUNAS_EXPORTACAO: ColunaExportacao<Cargo>[] = [
  { chave: 'cargo', rotulo: 'Cargo' },
  { chave: 'quantidade', rotulo: 'Quantidade' },
  { chave: 'valorBruto', rotulo: 'Valor Bruto', formatar: item => formatarMoeda(item.valorBruto) },
  { chave: 'valorDesconto', rotulo: 'Descontos', formatar: item => formatarMoeda(item.valorDesconto) },
  { chave: 'valorLiquido', rotulo: 'Valor Líquido', formatar: item => formatarMoeda(item.valorLiquido) },
  { chave: 'media', rotulo: 'Média por Servidor', formatar: item => formatarMoeda(item.media) }
]

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
    ordenacao,
    exportando,
    buscarTudoParaExportar
  } = useCargos()
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<Cargo[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  async function handleExportar() {
    const resultado = await buscarTudoParaExportar()
    setItensExportar(resultado.itens)
    setTruncadoExportar(resultado.truncado)
    setExportarAberto(true)
  }

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
          <button
            onClick={handleExportar}
            disabled={cargos.length === 0 || exportando}
            aria-label="Exportar todos os resultados dos filtros aplicados"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdDownload size={18} className={exportando ? 'animate-pulse' : ''} />
            {exportando ? 'Preparando...' : 'Exportar'}
          </button>

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

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar cargos"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="cargos"
        truncado={truncadoExportar}
      />
    </div>
  )
}
