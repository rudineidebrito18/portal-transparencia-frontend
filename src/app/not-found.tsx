import Link from 'next/link'
import { MdHome, MdSearchOff } from 'react-icons/md'

import Card from '@/components/ui/Card'

const PAGINAS_UTEIS = [
  { label: 'Portal da Transparência', href: '/transparencia' },
  { label: 'Notícias', href: '/noticias' },
  { label: 'Ouvidoria', href: '/ouvidoria' },
  { label: 'E-SIC', href: '/esic' }
]

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto p-2 py-12 text-center">
      <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
        <MdSearchOff size={32} />
      </div>

      <h1 className="text-4xl font-black text-primary mb-2">404</h1>
      <p className="text-lg font-semibold text-text-secondary mb-2">Página não encontrada</p>
      <p className="text-sm text-text-secondary/70 mb-8">
        O endereço acessado não existe ou foi movido. Confira o link ou volte para o início.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors mb-10"
      >
        <MdHome size={18} /> Voltar ao início
      </Link>

      <Card hoverable={false} className="p-6 text-left">
        <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary/60 mb-3">
          Páginas úteis
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {PAGINAS_UTEIS.map(pagina => (
            <li key={pagina.href}>
              <Link href={pagina.href} className="text-primary hover:underline">
                {pagina.label}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
