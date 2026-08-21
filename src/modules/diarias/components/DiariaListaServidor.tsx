import EmptyState from '@/components/ui/EmptyState'
import { Diaria } from '../types'
import DiariaCard from './DiariaCard'

interface Props {
  diarias: Diaria[]
}

export default function DiariaListaServidor({ diarias }: Props) {
  return (
    <div className="grid gap-4">
      {diarias.length > 0 ? (
        diarias.map(item => (
          <DiariaCard key={item.id} diaria={item} />
        ))
      ) : (
        <EmptyState message="Nenhuma diária encontrada com os filtros aplicados." />
      )}
    </div>
  )
}
