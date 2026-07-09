'use client'

interface PaginationProps {
  pagina: number
  totalPaginas: number
  onChange: (pagina: number) => void
  className?: string
}

export default function Pagination({ pagina, totalPaginas, onChange, className = '' }: PaginationProps) {
  if (totalPaginas <= 1) return null

  function gerarPaginas() {
    const paginas: (number | string)[] = []

    const inicio = Math.max(0, pagina - 2)
    const fim = Math.min(totalPaginas - 1, pagina + 2)

    if (inicio > 0) {
      paginas.push(0)
      if (inicio > 1) paginas.push('...')
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i)
    }

    if (fim < totalPaginas - 1) {
      if (fim < totalPaginas - 2) paginas.push('...')
      paginas.push(totalPaginas - 1)
    }

    return paginas
  }

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-4 md:px-5 py-3 shadow-sm ${className}`}>

      <span className="text-sm text-text-secondary">
        Página <strong>{pagina + 1}</strong> de <strong>{totalPaginas}</strong>
      </span>

      <div className="flex items-center gap-1 overflow-x-auto max-w-full scrollbar-thin">

        <button
          onClick={() => onChange(pagina - 1)}
          disabled={pagina === 0}
          className="px-3 py-2 rounded-lg border border-border/30 text-sm font-medium hover:bg-neutral-light disabled:opacity-40 transition whitespace-nowrap"
        >
          Anterior
        </button>

        {gerarPaginas().map((p, i) =>
          p === '...' ? (
            <span key={i} className="px-2 text-text-secondary text-sm">...</span>
          ) : (
            <button
              key={i}
              onClick={() => onChange(p as number)}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition whitespace-nowrap
                ${p === pagina
                  ? 'bg-primary text-white'
                  : 'hover:bg-neutral-light text-text-secondary'
                }`}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        <button
          onClick={() => onChange(pagina + 1)}
          disabled={pagina + 1 >= totalPaginas}
          className="px-3 py-2 rounded-lg border border-border/30 text-sm font-medium hover:bg-neutral-light disabled:opacity-40 transition whitespace-nowrap"
        >
          Próxima
        </button>

      </div>

    </div>
  )
}
