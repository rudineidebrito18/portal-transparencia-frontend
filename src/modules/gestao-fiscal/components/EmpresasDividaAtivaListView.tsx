'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import AsyncList from '@/components/ui/AsyncList'
import ModalExportar from '@/components/ui/ModalExportar'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { formatarMoeda } from '@/utils/currency'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { useEmpresasDividaAtiva } from '../hooks/useGestaoFiscal'
import { EmpresaDividaAtiva } from '../types'
import EmpresaDividaAtivaCard from './EmpresaDividaAtivaCard'
import EmpresaDividaAtivaFiltro from './EmpresaDividaAtivaFiltro'

const COLUNAS_EXPORTACAO: ColunaExportacao<EmpresaDividaAtiva>[] = [
  { chave: 'nome', rotulo: 'Nome' },
  { chave: 'razaoSocial', rotulo: 'Razão Social' },
  { chave: 'cnpj', rotulo: 'CNPJ' },
  { chave: 'descricao', rotulo: 'Descrição' },
  { chave: 'data', rotulo: 'Data', formatar: item => formatarData(item.data) },
  { chave: 'valor', rotulo: 'Valor Inscrito', formatar: item => formatarMoeda(item.valor) }
]

export default function EmpresasDividaAtivaListView() {
  const {
    data, loading, erro, pagina, totalPaginas, totalElements, atualizadoEm, setPagina, filtros, setFiltros, ordenacao, setOrdenacao,
    exportando, buscarTudoParaExportar
  } = useEmpresasDividaAtiva()
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<EmpresaDividaAtiva[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  async function handleExportar() {
    const resultado = await buscarTudoParaExportar()
    setItensExportar(resultado.itens)
    setTruncadoExportar(resultado.truncado)
    setExportarAberto(true)
  }

  return (
    <div>
      <EmpresaDividaAtivaFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm mb-6">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> empresas encontradas
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
            value={ordenacao || 'data,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="data,desc">Mais recentes</option>
            <option value="data,asc">Mais antigas</option>
            <option value="valor,desc">Maior valor</option>
            <option value="valor,asc">Menor valor</option>
          </Select>
        </div>
      </div>

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhuma empresa inscrita em dívida ativa encontrada."
        renderItem={empresa => <EmpresaDividaAtivaCard key={empresa.id} empresa={empresa} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar empresas em dívida ativa"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="empresas-divida-ativa"
        truncado={truncadoExportar}
      />
    </div>
  )
}
