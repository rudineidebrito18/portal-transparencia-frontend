import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'outline' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

// Variantes/tamanhos levantados a partir do uso real no site (84+ instâncias do padrão
// "primary", 24+ do "outline", 10+ do "ghost" tipo botão "Limpar") — não são um design
// novo, é a padronização do que já existia espalhado, classe idêntica, em cada
// *Filtro.tsx/página admin.
const variantClasses: Record<Variant, string> = {
  primary: 'rounded-lg bg-primary text-white hover:bg-primary-dark',
  outline: 'rounded-lg border border-border/30 hover:bg-neutral-light',
  danger: 'rounded-lg border border-error text-error hover:bg-error/10',
  ghost: 'text-text-secondary hover:text-red-600 font-normal transition-colors',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2 text-sm',
}

export default forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', type = 'button', className = '', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
})
