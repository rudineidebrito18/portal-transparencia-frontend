'use client'

import { useUrlState } from '@/hooks/useUrlState'
import { RecursoEducacao } from '../types'
import DocumentoListView from './DocumentoListView'

const CATEGORIAS: { recurso: RecursoEducacao; label: string }[] = [
  { recurso: 'lista-alunos', label: 'Lista de Alunos' },
  { recurso: 'lista-espera-creche', label: 'Lista de Espera - Creche' },
  { recurso: 'lista-solicitacao-matricula', label: 'Solicitações de Matrícula' },
  { recurso: 'planos', label: 'Plano Municipal de Educação' }
]

export default function EducacaoView() {
  const [aba, setAba] = useUrlState<RecursoEducacao>('categoria', CATEGORIAS[0].recurso)

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
