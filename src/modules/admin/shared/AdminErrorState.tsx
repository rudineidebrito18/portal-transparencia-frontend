interface Props {
  message: string
  title?: string
  onRetry?: () => void
  className?: string
}

// Equivalente admin de src/components/ui/ErrorState.tsx — mesmo motivo do
// AdminPagination.tsx/AdminEmptyState.tsx (tokens de cor diferentes, não dá pra
// simplesmente reaproveitar o componente do site público sem quebrar contraste).
export default function AdminErrorState({ message, title, onRetry, className = 'p-4' }: Props) {
  return (
    <div className={`bg-admin-error-light text-admin-error rounded-xl border border-admin-error/20 text-sm ${className}`}>
      {title && <p className="font-bold mb-2">{title}</p>}
      <p className={title ? 'mb-4' : undefined}>{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold hover:brightness-110 transition-all"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
