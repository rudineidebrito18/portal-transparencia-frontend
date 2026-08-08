import Link from 'next/link'
import { MdBadge, MdVisibility } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { ContratoLicitacao } from '../types'

interface Props {
  contrato: ContratoLicitacao
}

export default function FiscalContratoCard({ contrato }: Props) {
  return (
    <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <MdBadge size={22} />
        </div>

        <div>
          <h2 className="text-base font-bold text-primary leading-tight">
            {contrato.gestorContrato || 'Não informado'}
          </h2>
          <p className="text-sm text-text-secondary">
            Contrato Nº {contrato.numeroContrato}/{contrato.exercicio} · {contrato.fornecedor}
          </p>
          <p className="text-xs text-text-secondary/70">
            Vigência: {formatarData(contrato.dataInicio)} — {formatarData(contrato.dataTermino)}
          </p>
        </div>
      </div>

      <Link
        href={`/contratos/${contrato.id}`}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all whitespace-nowrap"
      >
        <MdVisibility size={18} />
        Ver contrato
      </Link>

    </Card>
  )
}
