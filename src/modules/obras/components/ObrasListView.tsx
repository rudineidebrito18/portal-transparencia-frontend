'use client'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import { useObras } from '../hooks/useObras'
import ObraCard from './ObraCard'

type Aba = 'todas' | 'paralisadas'

const ABAS: { valor: Aba; label: string }[] = [
  { valor: 'todas', label: 'Todas as Obras' },
  { valor: 'paralisadas', label: 'Obras Paralisadas' }
]

export default function ObrasListView() {
  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = useObras()
  const aba: Aba = filtros.paralisada ? 'paralisadas' : 'todas'

  function selecionarAba(novaAba: Aba) {
    setFiltros({ ...filtros, paralisada: novaAba === 'paralisadas' ? true : undefined })
  }

  return (
    <div>
      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ABAS.map(item => (
          <button
            key={item.valor}
            onClick={() => selecionarAba(item.valor)}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all
              ${aba === item.valor
                ? 'bg-primary text-white shadow-md'
                : 'bg-neutral-light text-text-secondary hover:bg-primary/10'
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage={aba === 'paralisadas' ? 'Nenhuma obra paralisada no momento.' : 'Nenhuma obra encontrada.'}
        renderItem={obra => <ObraCard key={obra.id} obra={obra} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
