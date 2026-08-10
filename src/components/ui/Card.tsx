import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  // Só pra card flutuando sobre um fundo colorido/com textura (hoje: acessos rápidos do
  // Hero) — não é decoração gratuita, ver comentário de `.card-glass` em globals.css.
  glass?: boolean
}

export default function Card({ children, className = '', hoverable = true, glass = false }: CardProps) {
  const superficie = glass
    ? 'card-glass border'
    : 'bg-white border border-border/30'

  return (
    <div
      className={`${superficie} rounded-xl shadow-sm ${
        hoverable ? 'hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] hover:border-primary/25 transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
