import EmptyState from '@/components/ui/EmptyState'
import { EmendaEstadual } from '../types'
import EmendaEstadualCard from './EmendaEstadualCard'

interface Props {
  emendas: EmendaEstadual[]
}

export default function EmendaEstadualListaServidor({ emendas }: Props) {
  if (emendas.length === 0) {
    return <EmptyState message="Nenhuma emenda estadual encontrada com os filtros aplicados." />
  }

  return (
    <div className="grid gap-4">
      {emendas.map(item => (
        <EmendaEstadualCard key={item.id} emenda={item} />
      ))}
    </div>
  )
}
