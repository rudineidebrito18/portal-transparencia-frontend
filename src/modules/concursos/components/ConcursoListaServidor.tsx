import EmptyState from '@/components/ui/EmptyState'
import { Concurso } from '../types'
import ConcursoCard from './ConcursoCard'

interface Props {
  concursos: Concurso[]
}

// Server Component: renderiza a lista já resolvida pelo fetch de ConcursosListView.
export default function ConcursoListaServidor({ concursos }: Props) {
  if (concursos.length === 0) {
    return <EmptyState message="Nenhum concurso ou seleção pública encontrado." />
  }

  return (
    <div className="grid gap-4">
      {concursos.map(concurso => (
        <ConcursoCard key={concurso.id} concurso={concurso} />
      ))}
    </div>
  )
}
