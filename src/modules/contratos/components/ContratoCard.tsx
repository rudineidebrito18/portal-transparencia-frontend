import Link from 'next/link'
import { MdVisibility } from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { contratoStatusLabel, contratoStatusStyle } from '../status'
import { ContratoLicitacao } from '../types'

interface Props {
  contrato: ContratoLicitacao
}

export default function ContratoCard({ contrato }: Props) {
  return (
    <Card className="p-5 flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <h2 className="text-base font-bold text-primary leading-tight">
          Contrato Nº {contrato.numeroContrato}/{contrato.exercicio}
        </h2>

        <Badge className={contratoStatusStyle(contrato.status)}>
          {contratoStatusLabel(contrato.status)}
        </Badge>
      </div>

      {/* OBJETO */}
      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
        {contrato.objeto}
      </p>

      {/* GRID INFO */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Fornecedor</p>
          <p className="font-semibold text-text-secondary truncate">
            {contrato.fornecedor}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Valor</p>
          <p className="font-semibold text-accent">
            {formatarMoeda(contrato.valorContrato)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Vigência</p>
          <p className="font-semibold text-text-secondary">
            {formatarData(contrato.dataInicio)} — {formatarData(contrato.dataTermino)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Unidade</p>
          <p className="font-semibold text-text-secondary truncate">
            {contrato.unidade || 'Não informada'}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-end pt-3 border-t border-border/20">
        <Link
          href={`/contratos/${contrato.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
        >
          <MdVisibility size={18} />
          Ver
        </Link>
      </div>

    </Card>
  )
}
