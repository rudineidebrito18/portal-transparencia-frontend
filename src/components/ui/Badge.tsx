import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md'
  // Classe de cor sólida pro indicador (ex: 'bg-yellow-500') — opcional. A cor continua
  // vindo só de `className` (bg/text claros o bastante pra WCAG); o dot é reforço visual
  // a mais, nunca o único jeito de identificar o status (o texto sempre fica).
  dotClassName?: string
}

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-xs px-3 py-1',
  md: 'text-xs px-4 py-1.5 shadow-sm'
}

export default function Badge({ children, className = '', size = 'sm', dotClassName }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap ${sizeClasses[size]} ${className}`}
    >
      {dotClassName && <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClassName}`} />}
      {children}
    </span>
  )
}
