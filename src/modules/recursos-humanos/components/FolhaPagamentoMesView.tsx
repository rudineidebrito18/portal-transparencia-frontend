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
import { formatarData, formatarDataHora, nomeMes } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { useFolhaPorMes } from '../hooks/useFolhaPorMes'
import { FolhaPagamentoServidor } from '../types'
import FolhaPagamentoFiltro from './FolhaPagamentoFiltro'

const COLUNAS_EXPORTACAO: ColunaExportacao<FolhaPagamentoServidor>[] = [
  { chave: 'nomeServidor', rotulo: 'Servidor' },
  { chave: 'cpfServidor', rotulo: 'CPF' },
  { chave: 'cargo', rotulo: 'Cargo' },
  { chave: 'unidadeNome', rotulo: 'Unidade' },
  { chave: 'cargaHoraria', rotulo: 'Carga Horária' },
  { chave: 'dataAdmissao', rotulo: 'Admissão', formatar: item => item.dataAdmissao ? formatarData(item.dataAdmissao) : '' },
  { chave: 'salarioBruto', rotulo: 'Salário Bruto', formatar: item => formatarMoeda(item.salarioBruto) },
  { chave: 'descontos', rotulo: 'Descontos', formatar: item => formatarMoeda(item.descontos) },
  { chave: 'salarioLiquido', rotulo: 'Salário Líquido', formatar: item => formatarMoeda(item.salarioLiquido) }
]

export default function FolhaPagamentoMesView() {
  const {
    data: folhas,
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
    setFiltros,
    exportando,
    buscarTudoParaExportar
  } = useFolhaPorMes()
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<FolhaPagamentoServidor[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  const anoAtual = new Date().getFullYear()
  const mesAtual = new Date().getMonth() + 1
  const mes = filtros.mes ?? mesAtual
  const ano = filtros.ano ?? anoAtual

  async function handleExportar() {
    const resultado = await buscarTudoParaExportar()
    setItensExportar(resultado.itens)
    setTruncadoExportar(resultado.truncado)
    setExportarAberto(true)
  }

  return (
    <div className="space-y-6">

      <FolhaPagamentoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> servidores na folha de {nomeMes(mes)}/{ano}
          {atualizadoEm && (
            <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportar}
            disabled={folhas.length === 0 || exportando}
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
            value={ordenacao || 'servidor.name,asc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="servidor.name,asc">Nome (A-Z)</option>
            <option value="servidor.name,desc">Nome (Z-A)</option>
            <option value="salarioLiquido,desc">Maior salário líquido</option>
            <option value="salarioLiquido,asc">Menor salário líquido</option>
          </Select>
        </div>

      </div>

      {erro && <ErrorState message={erro} />}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : (
        <>
          {folhas.length === 0 && !erro ? (
            <EmptyState message={`Nenhum registro de folha de pagamento para ${nomeMes(mes)}/${ano}.`} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border/30 shadow-sm">
                <table className="w-full text-sm bg-white">
                  <thead>
                    <tr className="bg-neutral-light/60 text-text-muted text-xs uppercase">
                      <th className="text-left px-4 py-3 font-semibold">Servidor</th>
                      <th className="text-left px-4 py-3 font-semibold">CPF</th>
                      <th className="text-left px-4 py-3 font-semibold">Cargo</th>
                      <th className="text-left px-4 py-3 font-semibold">Unidade</th>
                      <th className="text-right px-4 py-3 font-semibold">Salário Bruto</th>
                      <th className="text-right px-4 py-3 font-semibold">Descontos</th>
                      <th className="text-right px-4 py-3 font-semibold">Salário Líquido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {folhas.map(folha => (
                      <tr key={folha.id} className="border-t border-border/20">
                        <td className="px-4 py-3 font-semibold text-text-secondary">{folha.nomeServidor}</td>
                        <td className="px-4 py-3 text-text-secondary/70">{folha.cpfServidor}</td>
                        <td className="px-4 py-3 text-text-secondary">{folha.cargo || 'Não informado'}</td>
                        <td className="px-4 py-3 text-text-secondary">{folha.unidadeNome || 'Não informada'}</td>
                        <td className="px-4 py-3 text-right text-text-secondary">
                          {formatarMoeda(folha.salarioBruto)}
                        </td>
                        <td className="px-4 py-3 text-right text-error">
                          -{formatarMoeda(folha.descontos)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-accent">
                          {formatarMoeda(folha.salarioLiquido)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
            </>
          )}
        </>
      )}

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar folha de pagamento"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo={`folha-pagamento-${mes}-${ano}`}
        truncado={truncadoExportar}
      />
    </div>
  )
}
