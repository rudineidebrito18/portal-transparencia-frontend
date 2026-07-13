'use client'

import { useUrlState } from '@/hooks/useUrlState'
import { RecursoSaude } from '../types'
import DocumentoListView from './DocumentoListView'

const CATEGORIAS: { recurso: RecursoSaude; label: string }[] = [
  { recurso: 'planos', label: 'Planos de Saúde' },
  { recurso: 'relatorios', label: 'Relatórios' },
  { recurso: 'medicamentos', label: 'Medicamentos de Alto Custo' },
  { recurso: 'unidade', label: 'Unidades de Saúde' }
]

export default function SaudeView() {
  const [aba, setAba] = useUrlState<RecursoSaude>('categoria', CATEGORIAS[0].recurso)

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
