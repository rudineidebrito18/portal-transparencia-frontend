import { MdCampaign, MdNewspaper } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { ConteudoInstitucional } from '../types'

interface Props {
  item: ConteudoInstitucional
  variant: 'noticia' | 'aviso'
  compact?: boolean
}

export default function ConteudoInstitucionalCard({ item, variant, compact = false }: Props) {
  const Icon = variant === 'aviso' ? MdCampaign : MdNewspaper
  const iconStyle = variant === 'aviso' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'

  return (
    <Card className={`flex flex-col gap-3 ${compact ? 'p-4' : 'p-5'}`}>

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${iconStyle}`}>
          <Icon size={compact ? 16 : 20} />
        </div>

        <div>
          <h2 className={`font-bold text-primary leading-tight ${compact ? 'text-sm' : 'text-base'}`}>
            {item.titulo}
          </h2>
          <p className="text-xs text-text-secondary/60 mt-1">
            {formatarData(item.data)}
          </p>
        </div>
      </div>

      <p className={`text-text-secondary leading-relaxed ${compact ? 'text-xs line-clamp-3' : 'text-sm whitespace-pre-line'}`}>
        {item.texto}
      </p>

    </Card>
  )
}
