import EmptyState from '@/components/ui/EmptyState'
import { ConvenioDocumento } from '../types'
import ConvenioCard from './ConvenioCard'

interface Props {
  documentos: ConvenioDocumento[]
  emptyMessage: string
  urlArquivo: (id: number) => string
}

// Compartilhado pelos 3 sub-recursos de convênios (Transferências Recebidas/Realizadas,
// Acordos Firmados) — todos usam o mesmo ConvenioCard.
export default function ConvenioListaServidor({ documentos, emptyMessage, urlArquivo }: Props) {
  if (documentos.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="grid gap-4">
      {documentos.map(item => (
        <ConvenioCard key={item.id} documento={item} urlArquivo={urlArquivo(item.id)} />
      ))}
    </div>
  )
}
