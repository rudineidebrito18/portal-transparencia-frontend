import EmptyState from '@/components/ui/EmptyState'
import { Servidor } from '../types'
import ServidorCard from './ServidorCard'

interface Props {
  servidores: Servidor[]
}

export default function ServidorListaServidor({ servidores }: Props) {
  if (servidores.length === 0) {
    return <EmptyState message="Nenhum servidor encontrado com os filtros aplicados." />
  }

  return (
    <div className="grid gap-4">
      {servidores.map(item => (
        <ServidorCard key={item.id} servidor={item} />
      ))}
    </div>
  )
}
