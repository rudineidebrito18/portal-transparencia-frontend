import { SelectHTMLAttributes, forwardRef } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  // true (padrão) nos grids de *Filtro.tsx; false nos selects de "Ordenar" das
  // *ListView.tsx, que ficam lado a lado com o rótulo em largura natural. `w-full` e
  // `w-auto` têm a mesma especificidade CSS — só um prop garante qual vence, uma
  // className extra concatenada no fim da string não garante (depende da ordem de
  // geração do Tailwind, não da ordem no atributo).
  fullWidth?: boolean
}

// Mesma classe que se repetia em ~40 *Filtro.tsx/*ListView.tsx — só centraliza, não
// muda o visual.
export default forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = '', fullWidth = true, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={`${fullWidth ? 'w-full' : ''} border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary outline-none transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  )
})
