import EmptyState from '@/components/ui/EmptyState'
import { ContratoLicitacao } from '../types'
import ContratoCard from './ContratoCard'

interface Props {
  contratos: ContratoLicitacao[]
  emptyMessage: string
}

// Compartilhado entre Contratos e Aditivos de Contratos (ambos usam ContratoCard) — Fiscais de
// Contratos usa card próprio (FiscalContratoCard), ver FiscalContratoListaServidor.tsx.
export default function ContratoListaServidor({ contratos, emptyMessage }: Props) {
  if (contratos.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="grid gap-4">
      {contratos.map(item => (
        <ContratoCard key={item.id} contrato={item} />
      ))}
    </div>
  )
}
