import { MdOpenInNew } from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { FormaRepasseEmenda, FormaRepasseEmendaDescricao, TipoEmenda, TipoEmendaDescricao } from '../enums'
import { EmendaParlamentar } from '../types'

interface Props {
  emenda: EmendaParlamentar
}

export default function EmendaParlamentarCard({ emenda }: Props) {
  const tipoLabel = TipoEmendaDescricao[emenda.tipo as TipoEmenda] ?? emenda.tipo
  const formaRepasseLabel = FormaRepasseEmendaDescricao[emenda.formaRepasse as FormaRepasseEmenda] ?? emenda.formaRepasse

  return (
    <Card className="p-5 flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <h2 className="text-base font-bold text-primary leading-tight">
          Emenda Nº {emenda.numero}
        </h2>

        <Badge className="bg-primary/10 text-primary">{tipoLabel}</Badge>
      </div>

      {/* OBJETO */}
      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
        {emenda.objeto}
      </p>

      {/* GRID INFO */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Autoridade</p>
          <p className="font-semibold text-text-secondary truncate">
            {emenda.autoridade}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Publicação</p>
          <p className="font-semibold text-text-secondary">
            {formatarData(emenda.dataPublicacao)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Valor Previsto</p>
          <p className="font-semibold text-accent">
            {formatarMoeda(emenda.valorPrevisto)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Valor Repassado</p>
          <p className="font-semibold text-accent">
            {formatarMoeda(emenda.valorRepassado)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Origem</p>
          <p className="font-semibold text-text-secondary truncate">
            {emenda.origem}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Forma de Repasse</p>
          <p className="font-semibold text-text-secondary truncate">
            {formaRepasseLabel}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      {emenda.linkDetalhes && (
        <div className="flex items-center justify-end pt-3 border-t border-border/20">
          <a
            href={emenda.linkDetalhes}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
          >
            <MdOpenInNew size={18} />
            Ver detalhes
          </a>
        </div>
      )}

    </Card>
  )
}
