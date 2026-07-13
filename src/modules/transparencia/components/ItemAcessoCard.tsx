import Link from 'next/link'
import { MdArrowForward, MdOutlineHourglassEmpty } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { ItemAcesso } from '../data/secoes'

export default function ItemAcessoCard({ label, href }: ItemAcesso) {
  if (!href) {
    return (
      <Card
        hoverable={false}
        className="p-4 flex items-center justify-between gap-2 opacity-60 cursor-not-allowed"
      >
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary/60 whitespace-nowrap">
          <MdOutlineHourglassEmpty size={14} />
          Em breve
        </span>
      </Card>
    )
  }

  return (
    <Link href={href} className="block h-full">
      <Card className="p-4 h-full flex items-center justify-between gap-2 group">
        <span className="text-sm font-medium text-text-secondary group-hover:text-primary transition-colors">
          {label}
        </span>
        <MdArrowForward
          size={16}
          className="text-primary shrink-0 group-hover:translate-x-0.5 transition-transform"
        />
      </Card>
    </Link>
  )
}
