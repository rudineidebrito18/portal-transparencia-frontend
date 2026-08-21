import EmptyState from '@/components/ui/EmptyState'
import { EmendaFederal } from '../types'
import EmendaFederalCard from './EmendaFederalCard'

interface Props {
  emendas: EmendaFederal[]
}

export default function EmendaFederalListaServidor({ emendas }: Props) {
  if (emendas.length === 0) {
    return <EmptyState message="Nenhuma emenda federal encontrada com os filtros aplicados." />
  }

  return (
    <div className="grid gap-4">
      {emendas.map(item => (
        <EmendaFederalCard key={item.id} emenda={item} />
      ))}
    </div>
  )
}
