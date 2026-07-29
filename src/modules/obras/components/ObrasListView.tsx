'use client'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import { useObras } from '../hooks/useObras'
import ObraCard from './ObraCard'
import ObraFiltro from './ObraFiltro'

export default function ObrasListView() {
  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = useObras()

  return (
    <div>
      <ObraFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage={filtros.paralisada ? 'Nenhuma obra paralisada encontrada.' : 'Nenhuma obra encontrada.'}
        renderItem={obra => <ObraCard key={obra.id} obra={obra} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
