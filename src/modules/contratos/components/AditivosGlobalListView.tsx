'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import ModalExportar from '@/components/ui/ModalExportar'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { formatarMoeda } from '@/utils/currency'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { contratoStatusLabel } from '../status'
import { useContratosComAditivos } from '../hooks/useContratosComAditivos'
import { ContratoLicitacao } from '../types'
import ContratoCard from './ContratoCard'
import ContratoFiltro from './ContratoFiltro'

const COLUNAS_EXPORTACAO: ColunaExportacao<ContratoLicitacao>[] = [
  { chave: 'numeroSequencial', rotulo: 'Nº Sequencial' },
  { chave: 'numeroContrato', rotulo: 'Nº Contrato' },
  { chave: 'exercicio', rotulo: 'Exercício' },
  { chave: 'numeroLicitacao', rotulo: 'Licitação' },
  { chave: 'fornecedor', rotulo: 'Fornecedor' },
  { chave: 'status', rotulo: 'Status', formatar: item => contratoStatusLabel(item.status) },
  { chave: 'objeto', rotulo: 'Objeto' },
  { chave: 'unidade', rotulo: 'Unidade' },
  { chave: 'dataInicio', rotulo: 'Vigência Início', formatar: item => formatarData(item.dataInicio) },
  { chave: 'dataTermino', rotulo: 'Vigência Fim', formatar: item => formatarData(item.dataTermino) },
  { chave: 'valorContrato', rotulo: 'Valor', formatar: item => formatarMoeda(item.valorContrato) }
]

// Lista os contratos que têm pelo menos um aditivo (não os aditivos soltos) — pedido do
// checklist original: "melhor exibir as licitações que contém aditivos, e referenciá-las
// mostrando infos básicas igual na listagem de licitações, e botão de mais detalhes".
// O botão de detalhes leva direto pro contrato (não pra licitação em geral) — uma
// licitação pode ter vários contratos, e só o(s) que tem aditivo importa aqui.
// Reaproveita ContratoCard/ContratoFiltro da listagem normal de Contratos.
export default function AditivosGlobalListView() {
  const {
    data: contratos,
    loading,
    erro,
    pagina,
    totalPaginas,
    totalElements,
    atualizadoEm,
    setPagina,
    setOrdenacao,
    ordenacao,
    filtros,
    setFiltros
  } = useContratosComAditivos()
  const [exportarAberto, setExportarAberto] = useState(false)

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <ContratoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> contratos com aditivos encontrados
          {atualizadoEm && (
            <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExportarAberto(true)}
            disabled={contratos.length === 0}
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
            value={ordenacao || 'dataAssinatura,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="dataAssinatura,desc">Mais recentes</option>
            <option value="dataAssinatura,asc">Mais antigos</option>
          </Select>
        </div>

      </div>

      {/* ERRO */}
      {erro && <ErrorState message={erro} />}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <>
          {/* LISTA */}
          <div className="grid gap-4">
            {contratos.length > 0 ? (
              contratos.map(contrato => (
                <ContratoCard key={contrato.id} contrato={contrato} />
              ))
            ) : (
              <EmptyState message="Nenhum contrato com aditivo encontrado." />
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
        titulo="Exportar contratos com aditivos"
        itens={contratos}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="contratos-com-aditivos"
      />
    </div>
  )
}
