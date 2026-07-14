'use client'

import { useUrlState } from '@/hooks/useUrlState'
import { RecursoDocumentoRH } from '../types'
import DocumentoRHListView from './DocumentoRHListView'

const CATEGORIAS: { recurso: RecursoDocumentoRH; label: string }[] = [
  { recurso: 'estagiarios', label: 'Estagiários' },
  { recurso: 'terceirizados', label: 'Terceirizados' }
]

export default function DocumentosRHView() {
  const [aba, setAba] = useUrlState<RecursoDocumentoRH>('categoria', CATEGORIAS[0].recurso)

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
      <DocumentoRHListView key={aba} recurso={aba} />
    </div>
  )
}
