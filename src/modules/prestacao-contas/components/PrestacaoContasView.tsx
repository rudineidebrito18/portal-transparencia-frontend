'use client'

import { useState } from 'react'

import { RecursoPrestacaoContas } from '../types'
import DocumentoListView from './DocumentoListView'

const CATEGORIAS: { recurso: RecursoPrestacaoContas; label: string }[] = [
  { recurso: 'balanco-geral', label: 'Balanço Geral' },
  { recurso: 'parecer-previo', label: 'Parecer Prévio' },
  { recurso: 'julgamento-contas-tce', label: 'Julgamento de Contas (TCE)' },
  { recurso: 'julgamento-contas-legislativo', label: 'Julgamento de Contas (Legislativo)' },
  { recurso: 'prestacao-contas-anos-anteriores', label: 'Anos Anteriores' }
]

export default function PrestacaoContasView() {
  const [aba, setAba] = useState<RecursoPrestacaoContas>(CATEGORIAS[0].recurso)

  return (
    <div>
      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIAS.map(categoria => (
          <button
            key={categoria.recurso}
            onClick={() => setAba(categoria.recurso)}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all
              ${aba === categoria.recurso
                ? 'bg-primary text-white shadow-md'
                : 'bg-neutral-light text-text-secondary hover:bg-primary/10'
              }`}
          >
            {categoria.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <DocumentoListView key={aba} recurso={aba} />
    </div>
  )
}
