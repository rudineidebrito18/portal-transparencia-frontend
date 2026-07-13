import { MdFlightTakeoff, MdLocationOn } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { Diaria } from '../types'

interface Props {
  diaria: Diaria
}

export default function DiariaCard({ diaria }: Props) {
  return (
    <Card className="p-5 flex flex-col gap-4">

      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <MdFlightTakeoff size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-primary leading-tight">{diaria.beneficiario}</h2>
            <p className="text-xs text-text-secondary/60 mt-0.5">{diaria.cargo}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{diaria.motivo}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
        <div className="col-span-2">
          <p className="text-[11px] uppercase text-text-secondary/50 flex items-center gap-1">
            <MdLocationOn size={12} /> Destino
          </p>
          <p className="font-semibold text-text-secondary">{diaria.destino}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Período</p>
          <p className="font-semibold text-text-secondary">
            {formatarData(diaria.dataInicio)} a {formatarData(diaria.dataTermino)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Qtd. Diárias</p>
          <p className="font-semibold text-text-secondary">{diaria.quantDiarias}</p>
        </div>

        <div className="col-span-2">
          <p className="text-[11px] uppercase text-text-secondary/50">Valor Concedido</p>
          <p className="font-bold text-accent">{formatarMoeda(diaria.valorConcedido)}</p>
        </div>
      </div>

    </Card>
  )
}
