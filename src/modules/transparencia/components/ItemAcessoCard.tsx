import Link from 'next/link'
import { MdArrowForward, MdOutlineHourglassEmpty } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { ItemAcesso } from '../data/secoes'

export default function ItemAcessoCard({ label, href, icon: Icon }: ItemAcesso) {
  if (!href) {
    return (
      <Card
        hoverable={false}
        className="p-4 flex items-center gap-3 opacity-60 cursor-not-allowed"
      >
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral text-text-secondary/50 shrink-0">
          <Icon size={18} />
        </span>
        <span className="text-sm font-medium text-text-secondary flex-1">{label}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary/60 whitespace-nowrap">
          <MdOutlineHourglassEmpty size={14} />
          Em breve
        </span>
      </Card>
    )
  }

  return (
    <Link href={href} className="block h-full">
      <Card className="p-4 h-full flex items-center gap-3 border-l-4 border-l-primary group">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
          <Icon size={18} />
        </span>
        <span className="text-sm font-medium text-text-secondary flex-1 group-hover:text-primary transition-colors">
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
