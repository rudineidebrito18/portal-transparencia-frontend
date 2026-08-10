import { MdConstruction, MdLocationOn } from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { ObraPublica, StatusObraDescricao, StatusObraDot, StatusObraStyle, TipoObraDescricao } from '../types'

interface Props {
  obra: ObraPublica
}

export default function ObraCard({ obra }: Props) {
  return (
    <Card className="p-5 flex flex-col gap-4">

      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <MdConstruction size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-primary leading-tight">{obra.objeto}</h2>
            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
              <MdLocationOn size={14} />
              {obra.local}
            </p>
          </div>
        </div>

        <Badge className={StatusObraStyle[obra.status]} dotClassName={StatusObraDot[obra.status]}>
          {obra.paralisada ? 'Paralisada' : StatusObraDescricao[obra.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm">
        <div>
          <p className="text-xs uppercase text-text-muted">Tipo</p>
          <p className="font-semibold text-text-secondary">{TipoObraDescricao[obra.tipo]}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Fonte</p>
          <p className="font-semibold text-text-secondary">{obra.fonte}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Início</p>
          <p className="font-semibold text-text-secondary">{formatarData(obra.dataInicio)}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">
            {obra.dataTermino ? 'Término' : 'Previsão de término'}
          </p>
          <p className="font-semibold text-text-secondary">
            {formatarData(obra.dataTermino ?? obra.dataPrevistaTermino)}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-xs uppercase text-text-muted">Fornecedor</p>
          <p className="font-semibold text-text-secondary">{obra.nomeFornecedor}</p>
        </div>

        <div className="col-span-2">
          <p className="text-xs uppercase text-text-muted">Valor Total</p>
          <p className="font-bold text-accent">{formatarMoeda(obra.valorTotal)}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs uppercase text-text-muted mb-1">
          <span>Execução física</span>
          <span>{obra.percentualObra.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full bg-neutral-light overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${Math.min(obra.percentualObra, 100)}%` }}
          />
        </div>
      </div>

    </Card>
  )
}
