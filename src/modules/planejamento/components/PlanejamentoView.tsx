'use client'

import { useState } from 'react'

import { RecursoPlanejamento } from '../types'
import DocumentoListView from './DocumentoListView'

const CATEGORIAS: { recurso: RecursoPlanejamento; label: string }[] = [
  { recurso: 'ldo', label: 'LDO' },
  { recurso: 'loa', label: 'LOA' },
  { recurso: 'ppa', label: 'PPA' }
]

export default function PlanejamentoView() {
  const [aba, setAba] = useState<RecursoPlanejamento>(CATEGORIAS[0].recurso)

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
