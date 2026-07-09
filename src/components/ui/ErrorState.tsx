interface ErrorStateProps {
  message: string
  title?: string
  onRetry?: () => void
  className?: string
}

export default function ErrorState({ message, title, onRetry, className = 'p-4' }: ErrorStateProps) {
  return (
    <div className={`bg-error/10 text-error rounded-xl border border-error/20 text-sm ${className}`}>
      {title && <p className="font-bold mb-2">{title}</p>}
      <p className={title ? 'mb-4' : undefined}>{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
