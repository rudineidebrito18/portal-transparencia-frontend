'use client'

import { useState } from 'react'
import { MdClose, MdDownload, MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import ModalExportar from '@/components/ui/ModalExportar'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { TipoEdicaoDiario, TipoEdicaoDiarioDescricao } from '../enums'
import { useEdicoesDiario } from '../hooks/useEdicoesDiario'
import { EdicaoDiario, ResultadoBuscaEdicaoDiario } from '../types'
import { extrairTermos } from '../utils'
import BuscaResultadoCard from './BuscaResultadoCard'
import EdicaoCard from './EdicaoCard'
import EdicaoDiarioFiltro from './EdicaoDiarioFiltro'

function formatarTipo(tipo: string): string {
  return TipoEdicaoDiarioDescricao[tipo as TipoEdicaoDiario] ?? tipo
}

const COLUNAS_EDICAO: ColunaExportacao<EdicaoDiario>[] = [
  { chave: 'numeroEdicao', rotulo: 'Número' },
  { chave: 'tipo', rotulo: 'Tipo', formatar: item => formatarTipo(item.tipo) },
  { chave: 'dataPublicacao', rotulo: 'Data de Publicação', formatar: item => formatarData(item.dataPublicacao) },
  { chave: 'hash', rotulo: 'Hash (SHA-256)' }
]

const COLUNAS_BUSCA: ColunaExportacao<ResultadoBuscaEdicaoDiario>[] = [
  { chave: 'numeroEdicao', rotulo: 'Número' },
  { chave: 'tipo', rotulo: 'Tipo', formatar: item => formatarTipo(item.tipo) },
  { chave: 'dataPublicacao', rotulo: 'Data de Publicação', formatar: item => formatarData(item.dataPublicacao) },
  // O trecho vem do Meilisearch com <em> marcando o termo — não faz sentido no CSV/PDF, só
  // atrapalharia a leitura, então sai limpo aqui (a marcação visual só importa na tela).
  { chave: 'trechoDestaque', rotulo: 'Trecho encontrado', formatar: item => (item.trechoDestaque ?? '').replace(/<\/?em>/g, '') }
]

export default function DiarioOficialListView() {
  const {
    data: edicoes,
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
  } = useEdicoesDiario()

  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<(EdicaoDiario | ResultadoBuscaEdicaoDiario)[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  // Quando o filtro "Busca por conteúdo" está preenchido (vive na URL, ex.: ?termo=licitação),
  // a listagem exibe os resultados do Meilisearch no lugar da listagem estruturada.
  const termoAtivo = (filtros.termo ?? '').trim()
  // Termos separados (um por chip do filtro) pra exibir cada um sozinho no resumo, em vez de
  // um único bloco entre aspas com tudo junto.
  const termosAtivos = extrairTermos(termoAtivo)

  async function handleExportar() {
    const resultado = await buscarTudoParaExportar()
    setItensExportar(resultado.itens)
    setTruncadoExportar(resultado.truncado)
    setExportarAberto(true)
  }

  return (
    <div className="space-y-6">

      {/* FILTRO (inclui o campo "Busca por conteúdo") */}
      <EdicaoDiarioFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        {termoAtivo ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <span>
              <strong className="text-primary">{totalElements}</strong> resultado(s) para
            </span>
            {termosAtivos.map(t => (
              <span
                key={t}
                className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold whitespace-nowrap"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-text-secondary">
            <strong className="text-primary">{totalElements}</strong> edições encontradas
            {atualizadoEm && (
              <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
            )}
          </span>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportar}
            disabled={edicoes.length === 0 || exportando}
            aria-label="Exportar todos os resultados dos filtros aplicados"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdDownload size={18} className={exportando ? 'animate-pulse' : ''} />
            {exportando ? 'Preparando...' : 'Exportar'}
          </button>

          {termoAtivo ? (
            <button
              onClick={() => setFiltros({ ...filtros, termo: undefined })}
              className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
            >
              <MdClose size={16} />
              Limpar busca
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <MdSwapVert />
                Ordenar
              </div>

              <Select
                value={ordenacao || 'dataPublicacao,desc'}
                onChange={(e) => setOrdenacao(e.target.value)}
                aria-label="Ordenar por"
                fullWidth={false}
              >
                <option value="dataPublicacao,desc">Mais recentes</option>
                <option value="dataPublicacao,asc">Mais antigas</option>
              </Select>
            </>
          )}
        </div>

      </div>

      {/* ERRO */}
      {erro && <ErrorState message={erro} />}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* LISTA */}
          {/* Discrimina pelo formato real de cada item (presença de trechoDestaque), não por
              termoAtivo: termoAtivo vem da URL e muda de imediato quando o usuário digita, mas
              `edicoes` só é atualizado depois que o fetch termina (useEffect assíncrono) — por um
              frame, termoAtivo já é true com `edicoes` ainda contendo o resultado da listagem
              anterior, e o cast forçado pra ResultadoBuscaEdicaoDiario quebrava o BuscaResultadoCard. */}
          <div className="grid gap-4">
            {edicoes.length > 0 ? (
              edicoes.map(item => (
                'trechoDestaque' in item
                  ? <BuscaResultadoCard key={item.id} item={item as ResultadoBuscaEdicaoDiario} />
                  : <EdicaoCard key={item.id} edicao={item as EdicaoDiario} />
              ))
            ) : (
              <EmptyState
                message={termoAtivo
                  ? 'Nenhuma edição encontrada com o termo buscado. Tente outra palavra-chave.'
                  : 'Nenhuma edição encontrada com os filtros aplicados.'}
              />
            )}
          </div>

          {/* PAGINAÇÃO */}
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}

      {/* Um modal por formato de item — misturar os dois na mesma <ColunaExportacao> não dá,
          os campos são diferentes (trechoDestaque só existe no resultado de busca). termoAtivo
          no momento do clique em "Exportar" já garante que itensExportar é homogêneo. */}
      {termoAtivo ? (
        <ModalExportar
          aberto={exportarAberto}
          aoFechar={() => setExportarAberto(false)}
          titulo="Exportar resultados da busca"
          itens={itensExportar as ResultadoBuscaEdicaoDiario[]}
          colunas={COLUNAS_BUSCA}
          nomeBaseArquivo="diario-oficial-busca"
          truncado={truncadoExportar}
        />
      ) : (
        <ModalExportar
          aberto={exportarAberto}
          aoFechar={() => setExportarAberto(false)}
          titulo="Exportar edições"
          itens={itensExportar as EdicaoDiario[]}
          colunas={COLUNAS_EDICAO}
          nomeBaseArquivo="diario-oficial-edicoes"
          truncado={truncadoExportar}
        />
      )}
    </div>
  )
}
