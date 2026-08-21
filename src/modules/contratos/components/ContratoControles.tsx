'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import Select from '@/components/ui/Select'
import { formatarMoeda } from '@/utils/currency'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { contratoService } from '../contrato.service'
import { useContratoUrlState } from '../hooks/useContratoUrlState'
import { contratoStatusLabel } from '../status'
import { ContratoLicitacao } from '../types'
import ContratoFiltro from './ContratoFiltro'

const LIMITE_EXPORTACAO = 2000
const ORDENACAO_PADRAO = 'dataPublicacao,desc'

const COLUNAS_EXPORTACAO: ColunaExportacao<ContratoLicitacao>[] = [
  { chave: 'numeroSequencial', rotulo: 'Nº Sequencial' },
  { chave: 'numeroContrato', rotulo: 'Nº Contrato' },
  { chave: 'exercicio', rotulo: 'Exercício' },
  { chave: 'fornecedor', rotulo: 'Fornecedor' },
  { chave: 'status', rotulo: 'Status', formatar: item => contratoStatusLabel(item.status) },
  { chave: 'objeto', rotulo: 'Objeto' },
  { chave: 'unidade', rotulo: 'Unidade' },
  { chave: 'dataInicio', rotulo: 'Vigência Início', formatar: item => formatarData(item.dataInicio) },
  { chave: 'dataTermino', rotulo: 'Vigência Fim', formatar: item => formatarData(item.dataTermino) },
  { chave: 'valorContrato', rotulo: 'Valor', formatar: item => formatarMoeda(item.valorContrato) }
]

interface Props {
  totalElements: number
  atualizadoEm: string
}

export default function ContratoControles({ totalElements, atualizadoEm }: Props) {
  const { ordenacao, filtros, setOrdenacao, setFiltros } = useContratoUrlState(ORDENACAO_PADRAO)

  const [exportando, setExportando] = useState(false)
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<ContratoLicitacao[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  async function handleExportar() {
    setExportando(true)
    try {
      const resultado = await contratoService.listarTodos({
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
      <ContratoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> resultados encontrados
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
            <option value="dataPublicacao,desc">Mais recentes</option>
            <option value="dataPublicacao,asc">Mais antigos</option>
          </Select>
        </div>
      </div>

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar contratos"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="contratos"
        truncado={truncadoExportar}
      />
    </>
  )
}
