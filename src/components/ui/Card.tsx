import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
}

export default function Card({ children, className = '', hoverable = true }: CardProps) {
  return (
    <div
      className={`bg-white border border-border/30 rounded-xl shadow-sm ${hoverable ? 'hover:shadow-md hover:-translate-y-0.5 transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
