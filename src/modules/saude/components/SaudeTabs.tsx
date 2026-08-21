'use client'

import { useUrlState } from '@/hooks/useUrlState'
import { RecursoSaude } from '../types'

interface Props {
  categorias: { recurso: RecursoSaude; label: string }[]
  abaAtiva: RecursoSaude
}

export default function SaudeTabs({ categorias, abaAtiva }: Props) {
  const [, setAba] = useUrlState<RecursoSaude>('categoria', categorias[0].recurso)

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categorias.map(categoria => (
        <button
          key={categoria.recurso}
          onClick={() => setAba(categoria.recurso)}
          aria-current={abaAtiva === categoria.recurso ? 'true' : undefined}
          className={`px-5 py-2 text-sm font-semibold rounded-full transition-all
            ${abaAtiva === categoria.recurso
              ? 'bg-primary text-white shadow-md'
              : 'bg-neutral-light text-text-secondary hover:bg-primary/10'
            }`}
        >
          {categoria.label}
        </button>
      ))}
    </div>
  )
}
