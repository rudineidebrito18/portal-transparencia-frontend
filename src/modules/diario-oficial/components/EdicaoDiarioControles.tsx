'use client'

import { useState } from 'react'
import { MdClose, MdDownload, MdSwapVert } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import Select from '@/components/ui/Select'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { diarioOficialService } from '../diario-oficial.service'
import { TipoEdicaoDiario, TipoEdicaoDiarioDescricao } from '../enums'
import { useEdicaoDiarioUrlState } from '../hooks/useEdicaoDiarioUrlState'
import { EdicaoDiario, ResultadoBuscaEdicaoDiario } from '../types'
import { extrairTermos } from '../utils'
import EdicaoDiarioFiltro from './EdicaoDiarioFiltro'

// Mesmo teto de usePageableResource.buscarTudoParaExportar — ver comentário lá.
const LIMITE_EXPORTACAO = 2000

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

interface Props {
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
}

export default function EdicaoDiarioControles({
  totalElements,
  atualizadoEm,
  ordenacaoPadrao = 'dataPublicacao,desc'
}: Props) {
  const { ordenacao, filtros, setOrdenacao, setFiltros } = useEdicaoDiarioUrlState(ordenacaoPadrao)

  const [exportando, setExportando] = useState(false)
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<(EdicaoDiario | ResultadoBuscaEdicaoDiario)[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  // Quando o filtro "Busca por conteúdo" está preenchido (vive na URL, ex.: ?termo=licitação),
  // a listagem exibe os resultados do Meilisearch no lugar da listagem estruturada.
  const termoAtivo = (filtros.termo ?? '').trim()
  const termosAtivos = extrairTermos(termoAtivo)

  async function handleExportar() {
    setExportando(true)
    try {
      const params = { ...filtros, page: 0, size: LIMITE_EXPORTACAO, sort: ordenacao }
      const resultado = termoAtivo
        ? await diarioOficialService.buscarPorTexto(params)
        : await diarioOficialService.listar(params)
      setItensExportar(resultado.content)
      setTruncadoExportar(resultado.totalElements > LIMITE_EXPORTACAO)
      setExportarAberto(true)
    } finally {
      setExportando(false)
    }
  }

  return (
    <>
      <EdicaoDiarioFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

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
            <span className="text-text-muted"> · atualizado em {formatarDataHora(new Date(atualizadoEm))}</span>
          </span>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportar}
            disabled={totalElements === 0 || exportando}
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
                value={ordenacao}
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
    </>
  )
}
