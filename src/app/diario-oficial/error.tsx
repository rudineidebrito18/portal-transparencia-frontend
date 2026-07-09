'use client'

import ErrorState from '@/components/ui/ErrorState'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorDiarioOficial({ error, reset }: Props) {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <ErrorState
        title="Não foi possível carregar as edições do Diário Oficial."
        message={error.message}
        onRetry={reset}
        className="p-8"
      />
    </div>
  )
}
