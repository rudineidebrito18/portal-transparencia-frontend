'use client'

import { useUrlState } from '@/hooks/useUrlState'
import { TipoViagem, TipoViagemDescricao } from '../types'
import TabelaValoresListView from './TabelaValoresListView'

const ABAS = Object.values(TipoViagem)

export default function TabelaValoresView() {
  const [aba, setAba] = useUrlState<TipoViagem>('categoria', TipoViagem.NACIONAL)

  return (
    <div>
      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ABAS.map(tipo => (
          <button
            key={tipo}
            onClick={() => setAba(tipo)}
            aria-current={aba === tipo ? 'true' : undefined}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all
              ${aba === tipo
                ? 'bg-primary text-white shadow-md'
                : 'bg-neutral-light text-text-secondary hover:bg-primary/10'
              }`}
          >
            {TipoViagemDescricao[tipo]}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <TabelaValoresListView key={aba} tipoViagem={aba} />
    </div>
  )
}
