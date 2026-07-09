'use client'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorLicitacoes({ error, reset }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="p-8 bg-error/10 text-error rounded-lg border border-error/20">
        <p className="font-bold mb-2">Não foi possível carregar os dados de licitações.</p>
        <p className="text-sm mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
