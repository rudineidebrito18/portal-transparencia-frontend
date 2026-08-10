'use client'

interface Props {
  pagina: number
  totalPaginas: number
  onChange: (pagina: number) => void
  className?: string
}

// Mesma lógica de src/components/ui/Pagination.tsx (site público) — não dá pra
// reaproveitar o componente direto porque ele tem `bg-white`/`bg-primary` fixos, que
// quebrariam visualmente dentro do shell escuro do admin. Ver decisão de design system
// próprio pro painel em STATUS.md §2.27.
export default function AdminPagination({ pagina, totalPaginas, onChange, className = '' }: Props) {
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
    <div
      className={`flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl border border-admin-border bg-admin-surface px-4 md:px-5 py-3 ${className}`}
    >
      <span className="text-sm text-admin-text-muted">
        Página <strong className="text-admin-text">{pagina + 1}</strong> de{' '}
        <strong className="text-admin-text">{totalPaginas}</strong>
      </span>

      <div className="flex items-center gap-1 overflow-x-auto max-w-full scrollbar-thin">
        <button
          onClick={() => onChange(pagina - 1)}
          disabled={pagina === 0}
          className="min-h-11 px-3 flex items-center rounded-lg border border-admin-border text-sm font-medium text-admin-text-muted hover:bg-admin-surface-2 hover:text-admin-text disabled:opacity-40 transition whitespace-nowrap"
        >
          Anterior
        </button>

        {gerarPaginas().map((p, i) =>
          p === '...' ? (
            <span key={i} className="px-2 text-admin-text-faint text-sm">...</span>
          ) : (
            <button
              key={i}
              onClick={() => onChange(p as number)}
              className={`min-h-11 min-w-11 px-3 flex items-center justify-center rounded-md text-sm font-semibold transition whitespace-nowrap
                ${p === pagina
                  ? 'admin-gradient-accent text-white'
                  : 'hover:bg-admin-surface-2 text-admin-text-muted'
                }`}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        <button
          onClick={() => onChange(pagina + 1)}
          disabled={pagina + 1 >= totalPaginas}
          className="min-h-11 px-3 flex items-center rounded-lg border border-admin-border text-sm font-medium text-admin-text-muted hover:bg-admin-surface-2 hover:text-admin-text disabled:opacity-40 transition whitespace-nowrap"
        >
          Próxima
        </button>
      </div>
    </div>
  )
}
