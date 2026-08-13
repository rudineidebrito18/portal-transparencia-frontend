'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import ModalExportar from '@/components/ui/ModalExportar'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { formatarData, formatarDataHora } from '@/utils/date'
import { formatarMoeda } from '@/utils/currency'
import { ColunaExportacao } from '@/utils/exportacao'
import { useDiarias } from '../hooks/useDiarias'
import { Diaria } from '../types'
import DiariaCard from './DiariaCard'
import DiariaFiltro from './DiariaFiltro'

const COLUNAS_EXPORTACAO: ColunaExportacao<Diaria>[] = [
  { chave: 'numeroSequencial', rotulo: 'Nº Sequencial' },
  { chave: 'beneficiario', rotulo: 'Beneficiário' },
  { chave: 'cargo', rotulo: 'Cargo' },
  { chave: 'unidadeNome', rotulo: 'Unidade' },
  { chave: 'destino', rotulo: 'Destino' },
  { chave: 'motivo', rotulo: 'Motivo' },
  { chave: 'dataInicio', rotulo: 'Início', formatar: item => formatarData(item.dataInicio) },
  { chave: 'dataTermino', rotulo: 'Término', formatar: item => formatarData(item.dataTermino) },
  { chave: 'quantDiarias', rotulo: 'Qtd. Diárias' },
  { chave: 'valorConcedido', rotulo: 'Valor Concedido', formatar: item => formatarMoeda(item.valorConcedido) }
]

export default function DiariaListView() {
  const {
    data: diarias,
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
  } = useDiarias()
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<Diaria[]>([])
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
      <DiariaFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> diárias encontradas
          {atualizadoEm && (
            <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportar}
            disabled={diarias.length === 0 || exportando}
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
            value={ordenacao || 'dataInicio,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="dataInicio,desc">Mais recentes</option>
            <option value="dataInicio,asc">Mais antigas</option>
            <option value="valorConcedido,desc">Maior valor</option>
            <option value="valorConcedido,asc">Menor valor</option>
          </Select>
        </div>

      </div>

      {/* ERRO */}
      {erro && <ErrorState message={erro} />}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          {/* LISTA */}
          <div className="grid gap-4">
            {diarias.length > 0 ? (
              diarias.map(item => (
                <DiariaCard key={item.id} diaria={item} />
              ))
            ) : (
              <EmptyState message="Nenhuma diária encontrada com os filtros aplicados." />
            )}
          </div>

          {/* PAGINAÇÃO */}
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}

      {/* EXPORTAÇÃO (somente os dados da página atual) */}
      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar diárias"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="diarias"
        truncado={truncadoExportar}
      />
    </div>
  )
}
