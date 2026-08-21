'use client'

import { useUrlState } from '@/hooks/useUrlState'
import { Aba } from '../types'

interface Props {
  categorias: { aba: Aba; label: string }[]
  abaAtiva: Aba
}

// Só os botões de aba — trocam a URL (?categoria=X), sem renderizar conteúdo. Mesmo papel de
// DiarioOficialTabs/EducacaoTabs/SaudeTabs.
export default function ConveniosTabs({ categorias, abaAtiva }: Props) {
  const [, setAba] = useUrlState<Aba>('categoria', categorias[0].aba)

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categorias.map(categoria => (
        <button
          key={categoria.aba}
          onClick={() => setAba(categoria.aba)}
          aria-current={abaAtiva === categoria.aba ? 'true' : undefined}
          className={`px-5 py-2 text-sm font-semibold rounded-full transition-all
            ${abaAtiva === categoria.aba
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
