'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import Select from '@/components/ui/Select'
import { formatarMoeda } from '@/utils/currency'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { diariaService } from '../diaria.service'
import { useDiariaUrlState } from '../hooks/useDiariaUrlState'
import { Diaria } from '../types'
import DiariaFiltro from './DiariaFiltro'

const LIMITE_EXPORTACAO = 2000

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

interface Props {
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
}

export default function DiariaControles({
  totalElements,
  atualizadoEm,
  ordenacaoPadrao = 'dataInicio,desc'
}: Props) {
  const { ordenacao, filtros, setOrdenacao, setFiltros } = useDiariaUrlState(ordenacaoPadrao)

  const [exportando, setExportando] = useState(false)
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<Diaria[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  async function handleExportar() {
    setExportando(true)
    try {
      const resultado = await diariaService.listar({
        ...filtros,
        page: 0,
        size: LIMITE_EXPORTACAO,
        sort: ordenacao
      })
      setItensExportar(resultado.content)
      setTruncadoExportar(resultado.totalElements > LIMITE_EXPORTACAO)
      setExportarAberto(true)
    } finally {
      setExportando(false)
    }
  }

  return (
    <>
      <DiariaFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> diárias encontradas
          <span className="text-text-muted"> · atualizado em {formatarDataHora(new Date(atualizadoEm))}</span>
        </span>

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
            <option value="dataInicio,desc">Mais recentes</option>
            <option value="dataInicio,asc">Mais antigas</option>
            <option value="valorConcedido,desc">Maior valor</option>
            <option value="valorConcedido,asc">Menor valor</option>
          </Select>
        </div>
      </div>

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar diárias"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="diarias"
        truncado={truncadoExportar}
      />
    </>
  )
}
