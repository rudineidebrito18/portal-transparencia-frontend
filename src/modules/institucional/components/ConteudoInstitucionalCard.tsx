import { MdCampaign, MdNewspaper } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { ConteudoInstitucional } from '../types'

interface Props {
  item: ConteudoInstitucional
  variant: 'noticia' | 'aviso'
}

export default function ConteudoInstitucionalCard({ item, variant }: Props) {
  const Icon = variant === 'aviso' ? MdCampaign : MdNewspaper
  const iconStyle = variant === 'aviso' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'

  return (
    <Card className="p-5 flex flex-col gap-3">

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${iconStyle}`}>
          <Icon size={20} />
        </div>

        <div>
          <h2 className="text-base font-bold text-primary leading-tight">
            {item.titulo}
          </h2>
          <p className="text-xs text-text-secondary/60 mt-1">
            {formatarData(item.data)}
          </p>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
        {item.texto}
      </p>

    </Card>
  )
}
