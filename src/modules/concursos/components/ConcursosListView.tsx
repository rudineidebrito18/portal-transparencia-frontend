'use client'

import AsyncList from '@/components/ui/AsyncList'
import { useConcursos } from '../hooks/useConcursos'
import ConcursoCard from './ConcursoCard'

export default function ConcursosListView() {
  const { data, loading, erro } = useConcursos()

  return (
    <AsyncList
      data={data}
      loading={loading}
      erro={erro}
      emptyMessage="Nenhum concurso ou seleção pública encontrado."
      renderItem={concurso => <ConcursoCard key={concurso.id} concurso={concurso} />}
    />
  )
}
