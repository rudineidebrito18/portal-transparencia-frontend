'use client'

import { ComponentType, useState } from 'react'

import EmpresasDividaAtivaListView from './EmpresasDividaAtivaListView'
import EmpresasInidoneasListView from './EmpresasInidoneasListView'
import RelatoriosExecucaoOrcamentariaListView from './RelatoriosExecucaoOrcamentariaListView'
import RelatoriosGestaoFiscalListView from './RelatoriosGestaoFiscalListView'
import RenunciaFiscalListView from './RenunciaFiscalListView'

type Aba =
  | 'renuncia-fiscal'
  | 'execucao-orcamentaria'
  | 'rgf'
  | 'divida-ativa'
  | 'inidoneas'

const CATEGORIAS: { aba: Aba; label: string }[] = [
  { aba: 'renuncia-fiscal', label: 'Renúncia Fiscal' },
  { aba: 'execucao-orcamentaria', label: 'Execução Orçamentária' },
  { aba: 'rgf', label: 'Relatório de Gestão Fiscal' },
  { aba: 'divida-ativa', label: 'Empresas em Dívida Ativa' },
  { aba: 'inidoneas', label: 'Empresas Inidôneas/Suspensas' }
]

const CONTEUDO: Record<Aba, ComponentType> = {
  'renuncia-fiscal': RenunciaFiscalListView,
  'execucao-orcamentaria': RelatoriosExecucaoOrcamentariaListView,
  rgf: RelatoriosGestaoFiscalListView,
  'divida-ativa': EmpresasDividaAtivaListView,
  inidoneas: EmpresasInidoneasListView
}

export default function GestaoFiscalView() {
  const [aba, setAba] = useState<Aba>(CATEGORIAS[0].aba)
  const Conteudo = CONTEUDO[aba]

  return (
    <div>
      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIAS.map(categoria => (
          <button
            key={categoria.aba}
            onClick={() => setAba(categoria.aba)}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all
              ${aba === categoria.aba
                ? 'bg-primary text-white shadow-md'
                : 'bg-neutral-light text-text-secondary hover:bg-primary/10'
              }`}
          >
            {categoria.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <Conteudo key={aba} />
    </div>
  )
}
