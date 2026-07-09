'use client'

import { useState } from 'react'
import {
  MdAccountBalance,
  MdAssignment,
  MdAttachMoney,
  MdBalance,
  MdCalendarToday,
  MdDescription,
  MdGavel,
  MdInfoOutline
} from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import DocumentList from '@/components/ui/DocumentList'
import InfoBlock from '@/components/ui/InfoBlock'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import {
  StatusLicitacao,
  StatusLicitacaoDescricao,
  StatusLicitacaoStyle,
  TipoProcedimentoDescricao,
  TipoProcedimentoLicitacao
} from '../enums'
import { LicitacaoDetalhe as LicitacaoDetalheType } from '../types'
import LicitacaoContratos from './LicitacaoContratos'

interface Props {
  id: number
  licitacao: LicitacaoDetalheType
}

type TabType = 'dados' | 'contratos'

export default function LicitacaoDetalhe({ id, licitacao }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('dados')

  const formatarValor = (valor?: number) =>
    valor != null ? formatarMoeda(valor) : 'R$ 0,00'

  const statusKey = licitacao.status as StatusLicitacao
  const statusLabel = StatusLicitacaoDescricao[statusKey] ?? licitacao.status
  const statusStyle = StatusLicitacaoStyle[statusKey] ?? 'bg-gray-100 text-gray-600'

  const tipoLabel =
    TipoProcedimentoDescricao[licitacao.tipoProcedimentoLicitacao as TipoProcedimentoLicitacao] ||
    licitacao.tipoProcedimentoLicitacao

  return (
    <div className="bg-light border border-border/30 rounded-2xl shadow-md overflow-hidden mb-10">

      {/* HEADER */}
      <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/20">
        <div className="flex flex-col md:flex-row justify-between gap-4">

          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold uppercase bg-primary text-white px-2 py-1 rounded">
                {tipoLabel}
              </span>

              {licitacao.covid && (
                <span className="text-xs font-bold uppercase bg-red-500 text-white px-2 py-1 rounded">
                  COVID-19
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-primary tracking-tight">
              Instrumento Nº {licitacao.numeroInstrumento} / {licitacao.ano}
            </h1>
          </div>

          <Badge size="md" className={`self-start ${statusStyle}`}>
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 px-6 pt-4">
        <button
          onClick={() => setActiveTab('dados')}
          className={`px-5 py-2 text-sm font-semibold rounded-full transition-all
            ${activeTab === 'dados'
              ? 'bg-primary text-white shadow-md'
              : 'bg-neutral-light text-text-secondary hover:bg-primary/10'
            }`}
        >
          Dados
        </button>

        <button
          onClick={() => setActiveTab('contratos')}
          className={`px-5 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-2
            ${activeTab === 'contratos'
              ? 'bg-primary text-white shadow-md'
              : 'bg-neutral-light text-text-secondary hover:bg-primary/10'
            }`}
        >
          Contratos
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="p-6">

        {activeTab === 'dados' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">

            {/* GRID INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
              <InfoBlock label="Nº Processo" value={`${licitacao.numeroProcesso || '-'} / ${licitacao.ano}`} icon={MdInfoOutline} />
              <InfoBlock label="Publicação" value={formatarData(licitacao.dataPublicacao)} icon={MdCalendarToday} />
              <InfoBlock label="Sessão" value={formatarData(licitacao.dataSessao)} icon={MdGavel} />
              <InfoBlock label="Valor Estimado" value={formatarValor(licitacao.valorEstimado)} icon={MdAttachMoney} />

              <InfoBlock label="Abertura" value={formatarData(licitacao.dataAbertura)} />
              <InfoBlock label="Homologação" value={formatarData(licitacao.dataHomologacao)} />
              <InfoBlock label="Valor Adjudicado" value={formatarValor(licitacao.valorAdjudicado)} />
              <InfoBlock label="Dotação" value={formatarValor(licitacao.valorDotacao)} />

              <InfoBlock label="Critério" value={licitacao.tipoCriterio} />
              <InfoBlock label="Finalidade" value={licitacao.finalidade} />
              <InfoBlock label="Base Legal" value={licitacao.lei} icon={MdBalance} />
              <InfoBlock label="Regime" value={licitacao.regimeExecucao} />
            </div>

            {/* UNIDADE / AUTORIDADE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              <div className="bg-white p-5 rounded-xl border border-border/30 shadow-sm">
                <p className="text-xs uppercase text-text-secondary/50 mb-1 flex items-center gap-1">
                  <MdAccountBalance /> Unidade
                </p>
                <p className="font-bold text-primary uppercase">
                  {licitacao.unidade || 'Não informada'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-border/30 shadow-sm">
                <p className="text-xs uppercase text-text-secondary/50 mb-1">
                  Autoridade
                </p>
                <p className="font-bold text-text-secondary uppercase">
                  {licitacao.nomeAutoridade || 'Não informado'}
                </p>
              </div>
            </div>

            {/* OBJETO */}
            <div className="mb-10">
              <h3 className="font-bold text-primary uppercase text-sm tracking-wider mb-3 flex items-center gap-2">
                <MdDescription /> Objeto da Licitação
              </h3>

              <div className="bg-white border border-border/30 p-6 rounded-xl shadow-sm">
                <p className="text-text-secondary leading-relaxed text-[15px] text-justify">
                  {licitacao.objeto}
                </p>
              </div>
            </div>

            {/* DOCUMENTOS */}
            <div className="pt-6 border-t border-border/20">
              <DocumentList documentos={licitacao.documentos} />
            </div>

          </div>
        )}

        {activeTab === 'contratos' && (
          <div className="animate-in slide-in-from-right-4 duration-300">

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <MdAssignment size={22} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary">
                  Contratos Vinculados
                </h3>
                <p className="text-sm text-text-secondary">
                  Lista de contratos originados desta licitação
                </p>
              </div>
            </div>

            <LicitacaoContratos licitacaoId={id} />
          </div>
        )}

      </div>
    </div>
  )
}
