import Link from 'next/link'
import { MdArrowForward, MdOpenInNew, MdOutlineHourglassEmpty } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { ItemAcesso, CorSecao } from '../data/secoes'
import { CORES_SECAO } from './SecaoAcesso'

export default function ItemAcessoCard({ label, href, icon: Icon, cor }: ItemAcesso & { cor: CorSecao }) {
  const cores = CORES_SECAO[cor]

  if (!href) {
    return (
      <Card
        hoverable={false}
        className="p-4 flex items-center gap-3 opacity-60 cursor-not-allowed"
      >
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral text-text-muted shrink-0">
          <Icon size={18} />
        </span>
        <span className="text-sm font-medium text-text-secondary flex-1">{label}</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-text-muted whitespace-nowrap">
          <MdOutlineHourglassEmpty size={14} />
          Em breve
        </span>
      </Card>
    )
  }

  const externo = href.startsWith('http')

  const conteudo = (
    <Card className={`p-4 h-full flex items-center gap-3 border-l-4 group ${cores.borda}`}>
      <span className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors group-hover:text-white ${cores.badge} ${cores.hoverBg}`}>
        <Icon size={18} />
      </span>
      <span className={`text-sm font-medium text-text-secondary flex-1 transition-colors ${cores.hoverTexto}`}>
        {label}
      </span>
      {externo ? (
        <MdOpenInNew
          size={16}
          className={`shrink-0 ${cores.texto}`}
        />
      ) : (
        <MdArrowForward
          size={16}
          className={`shrink-0 group-hover:translate-x-0.5 transition-transform ${cores.texto}`}
        />
      )}
    </Card>
  )

  if (externo) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {conteudo}
      </a>
    )
  }

  return (
    <Link href={href} className="block h-full">
      {conteudo}
    </Link>
  )
}
