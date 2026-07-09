import Card from './Card'

interface EmptyStateProps {
  message: string
  className?: string
}

export default function EmptyState({ message, className = '' }: EmptyStateProps) {
  return (
    <Card hoverable={false} className={`p-8 text-center ${className}`}>
      <p className="text-sm text-text-secondary">{message}</p>
    </Card>
  )
}
