import { ComponentType } from 'react'
import Card from './Card'

interface InfoBlockProps {
  label: string
  value?: string | number
  icon?: ComponentType<{ size: number }>
}

export default function InfoBlock({ label, value, icon: Icon }: InfoBlockProps) {
  return (
    <Card className="p-4 flex items-start gap-3">
      {Icon && (
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
      )}
      <div>
        <p className="text-xs uppercase font-semibold text-text-muted tracking-wide">
          {label}
        </p>
        <p className="text-sm font-bold text-text-secondary break-words">
          {value || '-'}
        </p>
      </div>
    </Card>
  )
}
