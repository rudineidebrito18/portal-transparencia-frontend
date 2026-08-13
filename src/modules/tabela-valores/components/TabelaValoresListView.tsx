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
import { ColunaExportacao } from '@/utils/exportacao'
import { useTabelaValores } from '../hooks/useTabelaValores'
import { TabelaValores, TipoViagem, TipoViagemDescricao } from '../types'
import TabelaValoresCard from './TabelaValoresCard'
import TabelaValoresFiltro from './TabelaValoresFiltro'

interface Props {
  tipoViagem: TipoViagem
}

const COLUNAS_EXPORTACAO: ColunaExportacao<TabelaValores>[] = [
  { chave: 'descricao', rotulo: 'Descrição' },
  { chave: 'tipo', rotulo: 'Tipo de Viagem', formatar: item => TipoViagemDescricao[item.tipo] },
  { chave: 'data', rotulo: 'Data de Publicação', formatar: item => formatarData(item.data) }
]

export default function TabelaValoresListView({ tipoViagem }: Props) {
  const {
    data: documentos,
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
  } = useTabelaValores(tipoViagem)
  const [exportarAberto, setExportarAberto] = useState(false)

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <TabelaValoresFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> documentos encontrados
          {atualizadoEm && (
            <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExportarAberto(true)}
            disabled={documentos.length === 0}
            aria-label="Exportar os dados exibidos na tela"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdDownload size={18} />
            Exportar
          </button>

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
            <option value="data,asc">Mais antigos</option>
          </Select>
        </div>

      </div>

      {/* ERRO */}
      {erro && <ErrorState message={erro} />}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* LISTA */}
          <div className="grid gap-4">
            {documentos.length > 0 ? (
              documentos.map(item => (
                <TabelaValoresCard key={item.id} documento={item} />
              ))
            ) : (
              <EmptyState message="Nenhuma tabela de valores encontrada com os filtros aplicados." />
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
        titulo="Exportar tabela de valores"
        itens={documentos}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo={`tabela-valores-${tipoViagem.toLowerCase()}`}
      />
    </div>
  )
}
