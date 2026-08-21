import EmptyState from '@/components/ui/EmptyState'
import { ObraPublica } from '../types'
import ObraCard from './ObraCard'

interface Props {
  obras: ObraPublica[]
  paralisada?: boolean
}

export default function ObraListaServidor({ obras, paralisada }: Props) {
  if (obras.length === 0) {
    return <EmptyState message={paralisada ? 'Nenhuma obra paralisada encontrada.' : 'Nenhuma obra encontrada.'} />
  }

  return (
    <div className="grid gap-4">
      {obras.map(obra => (
        <ObraCard key={obra.id} obra={obra} />
      ))}
    </div>
  )
}
