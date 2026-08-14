'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import AsyncList from '@/components/ui/AsyncList'
import ModalExportar from '@/components/ui/ModalExportar'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { useConcursos } from '../hooks/useConcursos'
import { Concurso } from '../types'
import ConcursoCard from './ConcursoCard'
import ConcursoFiltro from './ConcursoFiltro'

const COLUNAS_EXPORTACAO: ColunaExportacao<Concurso>[] = [
  { chave: 'numero', rotulo: 'Número' },
  { chave: 'ano', rotulo: 'Ano' },
  { chave: 'descricao', rotulo: 'Descrição' },
  { chave: 'dataAbertura', rotulo: 'Abertura', formatar: item => formatarData(item.dataAbertura) },
  { chave: 'dataInscricoes', rotulo: 'Início das Inscrições', formatar: item => formatarData(item.dataInscricoes) },
  { chave: 'dataTerminoInscricoes', rotulo: 'Término das Inscrições', formatar: item => formatarData(item.dataTerminoInscricoes) },
  { chave: 'validate', rotulo: 'Validade', formatar: item => item.validate ? formatarData(item.validate) : '' },
  { chave: 'resumo', rotulo: 'Resumo' }
]

export default function ConcursosListView() {
  const {
    data, loading, erro, pagina, totalPaginas, totalElements, atualizadoEm, setPagina, filtros, setFiltros, ordenacao, setOrdenacao,
    exportando, buscarTudoParaExportar
  } = useConcursos()
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<Concurso[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  async function handleExportar() {
    const resultado = await buscarTudoParaExportar()
    setItensExportar(resultado.itens)
    setTruncadoExportar(resultado.truncado)
    setExportarAberto(true)
  }

  return (
    <div>
      <ConcursoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm mb-6">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> concursos encontrados
          {atualizadoEm && (
            <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportar}
            disabled={data.length === 0 || exportando}
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
            value={ordenacao || 'dataAbertura,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="dataAbertura,desc">Mais recentes</option>
            <option value="dataAbertura,asc">Mais antigos</option>
          </Select>
        </div>
      </div>

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhum concurso ou seleção pública encontrado."
        renderItem={concurso => <ConcursoCard key={concurso.id} concurso={concurso} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar concursos"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="concursos"
        truncado={truncadoExportar}
      />
    </div>
  )
}
