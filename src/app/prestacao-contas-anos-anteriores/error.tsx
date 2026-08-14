'use client'

import ErrorState from '@/components/ui/ErrorState'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPrestacaoContasAnosAnteriores({ error, reset }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <ErrorState
        title="Não foi possível carregar os dados da prestação de contas de anos anteriores."
        message={error.message}
        onRetry={reset}
        className="p-8"
      />
    </div>
  )
}
