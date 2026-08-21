import EmptyState from '@/components/ui/EmptyState'
import { ContratoLicitacao } from '../types'
import FiscalContratoCard from './FiscalContratoCard'

interface Props {
  contratos: ContratoLicitacao[]
}

export default function FiscalContratoListaServidor({ contratos }: Props) {
  if (contratos.length === 0) {
    return <EmptyState message="Nenhum contrato encontrado com os filtros aplicados." />
  }

  return (
    <div className="grid gap-4">
      {contratos.map(contrato => (
        <FiscalContratoCard key={contrato.id} contrato={contrato} />
      ))}
    </div>
  )
}
