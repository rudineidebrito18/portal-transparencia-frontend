import Link from 'next/link'
import { MdVisibility } from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { contratoStatusDot, contratoStatusLabel, contratoStatusStyle } from '../status'
import { ContratoLicitacao } from '../types'

interface Props {
  contrato: ContratoLicitacao
}

export default function ContratoCard({ contrato }: Props) {
  return (
    <Card className="p-4 flex flex-col gap-2.5">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
            Nº Sequencial: {contrato.numeroSequencial}
          </p>
          <h2 className="text-base font-bold text-primary leading-tight">
            Contrato Nº {contrato.numeroContrato}/{contrato.exercicio}
          </h2>
        </div>

        <div className="flex flex-col items-end gap-1">
          <p className="text-xs uppercase text-text-muted font-semibold">Status</p>
          <Badge className={contratoStatusStyle(contrato.status)} dotClassName={contratoStatusDot(contrato.status)}>
            {contratoStatusLabel(contrato.status)}
          </Badge>
        </div>
      </div>

      {/* OBJETO */}
      <p className="text-sm text-text-secondary leading-snug line-clamp-2">
        <span className="font-semibold text-text-muted">Objeto: </span>
        {contrato.objeto}
      </p>

      {/* GRID INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        <div>
          <p className="text-xs uppercase text-text-muted">Fornecedor</p>
          <p className="font-semibold text-text-secondary break-words">
            {contrato.fornecedor}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Valor</p>
          <p className="font-semibold text-accent">
            {formatarMoeda(contrato.valorContrato)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Vigência</p>
          <p className="font-semibold text-text-secondary">
            {formatarData(contrato.dataInicio)} — {formatarData(contrato.dataTermino)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Unidade</p>
          <p className="font-semibold text-text-secondary break-words">
            {contrato.unidade || 'Não informada'}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-end pt-2 border-t border-border/20">
        <Link
          href={`/contratos/${contrato.id}`}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
        >
          <MdVisibility size={18} />
          Ver
        </Link>
      </div>

    </Card>
  )
}
