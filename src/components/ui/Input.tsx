import { InputHTMLAttributes, forwardRef } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

// Classe idêntica à que já se repetia (copiada/colada) em ~40 *Filtro.tsx — só
// centraliza, não muda o visual.
export default forwardRef<HTMLInputElement, InputProps>(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary outline-none transition-all ${className}`}
      {...props}
    />
  )
})
