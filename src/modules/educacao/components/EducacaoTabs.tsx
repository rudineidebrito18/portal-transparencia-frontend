'use client'

import { useUrlState } from '@/hooks/useUrlState'
import { RecursoEducacao } from '../types'

interface Props {
  categorias: { recurso: RecursoEducacao; label: string }[]
  abaAtiva: RecursoEducacao
}

// Só os botões de aba — trocam a URL (?categoria=X), sem buscar nada. O Server Component pai
// (EducacaoView) já leu essa mesma URL pra decidir o que buscar; useUrlState aqui garante que o
// clique navegue certo (client-only, next/navigation) e que o botão ativo fique destacado sem
// esperar o round-trip do servidor.
export default function EducacaoTabs({ categorias, abaAtiva }: Props) {
  const [, setAba] = useUrlState<RecursoEducacao>('categoria', categorias[0].recurso)

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
