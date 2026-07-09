import Link from 'next/link'
import { MdArrowForward } from 'react-icons/md'

interface Props {
  title: string
  href: string
  linkLabel?: string
}

export default function SectionHeader({ title, href, linkLabel = 'Ver todos' }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-primary">
        {title}
      </h2>

      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline whitespace-nowrap"
      >
        {linkLabel}
        <MdArrowForward size={16} />
      </Link>
    </div>
  )
}
