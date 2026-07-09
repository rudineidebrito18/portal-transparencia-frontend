import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md'
}

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-[11px] px-3 py-1',
  md: 'text-xs px-4 py-1.5 shadow-sm'
}

export default function Badge({ children, className = '', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full font-semibold uppercase tracking-wide whitespace-nowrap ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  )
}
