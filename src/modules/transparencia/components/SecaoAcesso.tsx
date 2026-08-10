import { CorSecao, SecaoAcesso as SecaoAcessoType } from '../data/secoes'
import ItemAcessoCard from './ItemAcessoCard'

// Classes escritas por extenso (não montadas via template string) porque o scanner do
// Tailwind precisa achar o nome literal da classe no código-fonte para gerá-la — uma
// string interpolada tipo `bg-${cor}/10` não é detectada.
interface CorClasses {
  badge: string
  titulo: string
  borda: string
  texto: string
  hoverBg: string
  hoverTexto: string
}

export const CORES_SECAO: Record<CorSecao, CorClasses> = {
  primary: {
    badge: 'bg-primary/10 text-primary',
    titulo: 'text-primary',
    borda: 'border-l-primary',
    texto: 'text-primary',
    hoverBg: 'group-hover:bg-primary',
    hoverTexto: 'group-hover:text-primary',
  },
  accent: {
    badge: 'bg-accent/10 text-accent',
    titulo: 'text-accent',
    borda: 'border-l-accent',
    texto: 'text-accent',
    hoverBg: 'group-hover:bg-accent',
    hoverTexto: 'group-hover:text-accent',
  },
  secondary: {
    badge: 'bg-secondary/10 text-secondary',
    titulo: 'text-secondary',
    borda: 'border-l-secondary',
    texto: 'text-secondary',
    hoverBg: 'group-hover:bg-secondary',
    hoverTexto: 'group-hover:text-secondary',
  },
  'primary-light': {
    badge: 'bg-primary-light/10 text-primary-light',
    titulo: 'text-primary-light',
    borda: 'border-l-primary-light',
    texto: 'text-primary-light',
    hoverBg: 'group-hover:bg-primary-light',
    hoverTexto: 'group-hover:text-primary-light',
  },
  'accent-dark': {
    badge: 'bg-accent-dark/10 text-accent-dark',
    titulo: 'text-accent-dark',
    borda: 'border-l-accent-dark',
    texto: 'text-accent-dark',
    hoverBg: 'group-hover:bg-accent-dark',
    hoverTexto: 'group-hover:text-accent-dark',
  },
  'accent-light': {
    badge: 'bg-accent-light/10 text-accent-light',
    titulo: 'text-accent-light',
    borda: 'border-l-accent-light',
    texto: 'text-accent-light',
    // hoverBg usa accent-dark (não accent-light) de propósito: o ícone vira branco no
    // hover (group-hover:text-white, ver ItemAcessoCard.tsx) e branco sobre accent-light
    // (#3399ff) dá só ~2.9:1 de contraste — abaixo do mínimo de 3:1 do WCAG pra objetos
    // gráficos/ícones. accent-dark preserva a família de cor (ainda "azul acento") e
    // passa com folga (~6.7:1).
    hoverBg: 'group-hover:bg-accent-dark',
    hoverTexto: 'group-hover:text-accent-light',
  },
  'primary-dark': {
    badge: 'bg-primary-dark/10 text-primary-dark',
    titulo: 'text-primary-dark',
    borda: 'border-l-primary-dark',
    texto: 'text-primary-dark',
    hoverBg: 'group-hover:bg-primary-dark',
    hoverTexto: 'group-hover:text-primary-dark',
  },
  // Verde da logo (coqueiros) — 4ª cor de marca, token `tertiary` em globals.css. Mesmo
  // raciocínio de contraste do `accent-light` acima: ícone vira branco no hover
  // (`group-hover:text-white`) e branco sobre `tertiary` puro (#2fa84f) dá só ~3:1 —
  // sob o mínimo confortável. `tertiary-dark` (#1f7a38) passa com folga (~5,4:1).
  tertiary: {
    badge: 'bg-tertiary/10 text-tertiary',
    titulo: 'text-tertiary',
    borda: 'border-l-tertiary',
    texto: 'text-tertiary',
    hoverBg: 'group-hover:bg-tertiary-dark',
    hoverTexto: 'group-hover:text-tertiary',
  },
}

export default function SecaoAcesso({ titulo, icon: Icon, cor, itens }: SecaoAcessoType) {
  const cores = CORES_SECAO[cor]

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${cores.badge}`}>
          <Icon size={22} />
        </span>
        <h2 className={`text-lg md:text-xl font-bold uppercase ${cores.titulo}`}>{titulo}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {itens.map((item) => (
          <ItemAcessoCard key={item.label} {...item} cor={cor} />
        ))}
      </div>
    </section>
  )
}
