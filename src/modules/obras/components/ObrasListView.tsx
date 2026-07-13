'use client'

import AsyncList from '@/components/ui/AsyncList'
import { useUrlState } from '@/hooks/useUrlState'
import { useObras } from '../hooks/useObras'
import ObraCard from './ObraCard'

type Filtro = 'todas' | 'paralisadas'

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: 'todas', label: 'Todas as Obras' },
  { valor: 'paralisadas', label: 'Obras Paralisadas' }
]

// Backend não expõe filtro por query param pra esse recurso (GET /obras retorna
// tudo de uma vez), então "Paralisadas" filtra em cima da lista já carregada.
export default function ObrasListView() {
  const [filtro, setFiltro] = useUrlState<Filtro>('status', 'todas')
  const { data, loading, erro } = useObras()

  const obras = filtro === 'paralisadas' ? data.filter(obra => obra.paralisada) : data

  return (
    <div>
      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTROS.map(item => (
          <button
            key={item.valor}
            onClick={() => setFiltro(item.valor)}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all
              ${filtro === item.valor
                ? 'bg-primary text-white shadow-md'
                : 'bg-neutral-light text-text-secondary hover:bg-primary/10'
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <AsyncList
        data={obras}
        loading={loading}
        erro={erro}
        emptyMessage={filtro === 'paralisadas' ? 'Nenhuma obra paralisada no momento.' : 'Nenhuma obra encontrada.'}
        renderItem={obra => <ObraCard key={obra.id} obra={obra} />}
      />
    </div>
  )
}
