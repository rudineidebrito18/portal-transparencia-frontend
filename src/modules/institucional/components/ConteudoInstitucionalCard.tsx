import Link from 'next/link'
import { MdArrowForward, MdCampaign, MdNewspaper } from 'react-icons/md'

import Card from '@/components/ui/Card'
import ImagemCarrossel from '@/components/ui/ImagemCarrossel'
import { formatarData } from '@/utils/date'
import { ConteudoInstitucional } from '../types'
import { imagensOrdenadas } from '../utils'

interface Props {
  item: ConteudoInstitucional
  variant: 'noticia' | 'aviso'
}

export default function ConteudoInstitucionalCard({ item, variant }: Props) {
  const ehNoticia = variant === 'noticia'
  const Icon = ehNoticia ? MdNewspaper : MdCampaign
  const iconStyle = ehNoticia ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
  const imagens = imagensOrdenadas(item)

  return (
    <Card className="p-5 flex flex-col gap-3 h-full">

      {imagens.length > 0 && (
        <ImagemCarrossel imagens={imagens} alt={item.titulo} className="h-40 -mt-1 rounded-lg" />
      )}

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${iconStyle}`}>
          <Icon size={20} />
        </div>

        <div>
          <h2 className="text-base font-bold text-primary leading-tight">
            {item.titulo}
          </h2>
          <p className="text-xs text-text-muted mt-1">
            {formatarData(item.data)}
          </p>
        </div>
      </div>

      {/* Notícias tem página de detalhe pra ler o texto inteiro — resume aqui pra
          manter os cards do mesmo tamanho no grid. Avisos não tem detalhe (uso mais
          pontual/curto), então continua mostrando o texto todo, como sempre foi. */}
      <p className={`text-sm text-text-secondary leading-relaxed whitespace-pre-line ${ehNoticia ? 'line-clamp-4' : ''}`}>
        {item.texto}
      </p>

      {ehNoticia && (
        <Link
          href={`/noticias/${item.id}`}
          className="mt-auto self-start inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Ver detalhes <MdArrowForward size={16} />
        </Link>
      )}

    </Card>
  )
}
