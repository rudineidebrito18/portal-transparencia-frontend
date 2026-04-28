'use client'

import { StatusLicitacao, StatusLicitacaoDescricao } from '@/interfaces/enums/StatusLicitacao'
import { TipoProcedimentoDescricao, TipoProcedimentoLicitacao } from '@/interfaces/enums/TipoProcedimentoLicitacao'
import { Licitacao } from '@/interfaces/licitacao/Licitacao'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { useState } from 'react'
import {
    MdAccountBalance,
    MdAssignment,
    MdAttachMoney,
    MdBalance, MdCalendarToday,
    MdDescription, MdGavel, MdInfoOutline
} from 'react-icons/md'
import LicitacaoContratos from './LicitacaoContratos'
import LicitacaoDocumentos from './LicitacaoDocumentos'

interface Props {
  licitacao: Licitacao
}

interface InfoBlockProps {
  label: string
  value?: string | number
  icon?: React.ComponentType<{ size: number }>
  colorClass?: string
}

type TabType = 'dados' | 'contratos'

export default function LicitacaoDetalhe({ licitacao }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('dados')

  const formatarValor = (valor?: number) => valor != null ? formatarMoeda(valor) : 'R$ 0,00'

  const InfoBlock = ({ label, value, icon: Icon, colorClass = "text-primary" }: InfoBlockProps) => (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:bg-neutral-light transition-colors">
      {Icon && <div className={`p-2 rounded-md bg-neutral-light ${colorClass}`}><Icon size={18} /></div>}
      <div className="overflow-hidden">
        <p className="text-[10px] uppercase font-bold text-text-secondary/60 tracking-wider truncate">{label}</p>
        <p className="text-sm font-bold text-text-secondary truncate">{value || '-'}</p>
      </div>
    </div>
  )

  return (
    <div className="bg-light shadow-lg border border-border rounded-xl overflow-hidden mb-8">
      
      <div className="flex bg-neutral-light border-b border-border px-4 pt-2 gap-1">
        <button 
          onClick={() => setActiveTab('dados')}
          className={`px-6 py-2 text-sm font-bold transition-all rounded-t-md border-t border-l border-r ${
            activeTab === 'dados' 
            ? 'bg-light border-border text-primary -mb-[1px]' 
            : 'bg-transparent border-transparent text-text-secondary/60 hover:text-primary'
          }`}
        >
          Dados da Licitação
        </button>
        <button 
          onClick={() => setActiveTab('contratos')}
          className={`px-6 py-2 text-sm font-bold transition-all rounded-t-md border-t border-l border-r flex items-center gap-2 ${
            activeTab === 'contratos' 
            ? 'bg-light border-border text-primary -mb-[1px]' 
            : 'bg-transparent border-transparent text-text-secondary/60 hover:text-primary'
          }`}
        >
          Contratos
          {licitacao.contratos && licitacao.contratos.length > 0 && (
            <span className="bg-secondary text-text-primary text-[10px] px-1.5 py-0.5 rounded-full">
              {licitacao.contratos.length}
            </span>
          )}
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'dados' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-primary/5 p-4 rounded-lg border border-primary/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase bg-secondary text-text-primary px-2 py-0.5 rounded">
                    {TipoProcedimentoDescricao[licitacao.tipoProcedimento as TipoProcedimentoLicitacao] || licitacao.tipoProcedimento}
                  </span>
                  {licitacao.covid && <span className="bg-error text-text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase">COVID-19</span>}
                </div>
                <h2 className="text-xl font-bold text-primary">Instrumento Nº {licitacao.numeroInstrumento} / {licitacao.ano}</h2>
              </div>
              <div className={`px-4 py-2 rounded-lg border text-sm font-bold bg-white shadow-sm ${licitacao.status === 'ABERTA' ? 'text-success border-success/20' : 'text-warning border-warning/20'}`}>
                {StatusLicitacaoDescricao[licitacao.status as StatusLicitacao] || licitacao.status}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <InfoBlock label="Nº Processo" value={`${licitacao.numeroProcesso || '-'} / ${licitacao.ano}`} icon={MdInfoOutline} />
              <InfoBlock label="Publicação" value={formatarData(licitacao.dataPublicacao)} icon={MdCalendarToday} />
              <InfoBlock label="Data da Sessão" value={formatarData(licitacao.dataSessao)} icon={MdGavel} colorClass="text-secondary" />
              <InfoBlock label="Valor Estimado" value={formatarValor(licitacao.valorEstimado)} icon={MdAttachMoney} colorClass="text-accent" />
              
              <InfoBlock label="Data Abertura" value={formatarData(licitacao.dataAbertura)} />
              <InfoBlock label="Data Homologação" value={formatarData(licitacao.dataHomologacao)} />
              <InfoBlock label="Valor Adjudicado" value={formatarValor(licitacao.valorAdjudicado)} />
              <InfoBlock label="Valor da Dotação" value={formatarValor(licitacao.valorDotacao)} />

              <InfoBlock label="Tipo Critério" value={licitacao.tipoCriterio} />
              <InfoBlock label="Finalidade" value={licitacao.finalidade} />
              <InfoBlock label="Lei / Base Legal" value={licitacao.lei} icon={MdBalance} />
              <InfoBlock label="Regime Execução" value={licitacao.regimeExecucao} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-neutral-light p-4 rounded-lg border-l-4 border-primary">
                <p className="text-[10px] uppercase font-bold text-text-secondary/50 mb-1 flex items-center gap-1"><MdAccountBalance /> Unidade</p>
                <p className="text-sm font-bold text-primary uppercase">{licitacao.unidade || 'Não informada'}</p>
              </div>
              <div className="bg-neutral-light p-4 rounded-lg border-l-4 border-accent">
                <p className="text-[10px] uppercase font-bold text-text-secondary/50 mb-1">Autoridade</p>
                <p className="text-sm font-bold text-text-secondary uppercase">{licitacao.nomeAutoridade || 'Não informado'}</p>
              </div>
            </div>

            {/* Objeto */}
            <div className="mb-10">
              <h3 className="font-bold text-primary uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <MdDescription size={18} /> Objeto da Licitação
              </h3>
              <div className="bg-white border border-border p-6 rounded-lg shadow-sm">
                <p className="text-text-secondary leading-relaxed text-sm text-justify uppercase font-medium">
                  {licitacao.objeto}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-border/10">
              <LicitacaoDocumentos documentos={licitacao.documentos} />
            </div>
          </div>
        )}

        {activeTab === 'contratos' && (
          <div className="animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-secondary/10 p-3 rounded-full text-secondary">
                  <MdAssignment size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">Contratos Vinculados</h3>
                  <p className="text-sm text-text-secondary">Visualize os contratos originados desta licitação</p>
                </div>
             </div>
             
             <LicitacaoContratos contratos={licitacao.contratos} />
          </div>
        )}
      </div>
    </div>
  )
}