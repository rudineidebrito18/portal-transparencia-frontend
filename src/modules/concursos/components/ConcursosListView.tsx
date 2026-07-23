'use client'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import { useConcursos } from '../hooks/useConcursos'
import ConcursoCard from './ConcursoCard'

export default function ConcursosListView() {
  const { data, loading, erro, pagina, totalPaginas, setPagina } = useConcursos()

  return (
    <div>
      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhum concurso ou seleção pública encontrado."
        renderItem={concurso => <ConcursoCard key={concurso.id} concurso={concurso} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
