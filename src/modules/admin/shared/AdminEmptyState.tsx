interface Props {
  message: string
  className?: string
}

// Equivalente admin de src/components/ui/EmptyState.tsx (que usa Card, `bg-white`
// fixo) — mesmo motivo do AdminPagination.tsx.
export default function AdminEmptyState({ message, className = '' }: Props) {
  return (
    <div className={`rounded-2xl border border-admin-border bg-admin-surface p-8 text-center ${className}`}>
      <p className="text-sm text-admin-text-muted">{message}</p>
    </div>
  )
}
