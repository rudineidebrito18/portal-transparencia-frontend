import Link from 'next/link'
import { MdExpandMore } from 'react-icons/md'

import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'
import { secoesAcessoInformacao } from '@/modules/transparencia/data/secoes'

const LINKS_INSTITUCIONAL = [
  { label: 'Início', href: '/' },
  { label: 'Prefeito', href: '/prefeito' },
  { label: 'Vice-Prefeito', href: '/vice-prefeito' },
  { label: 'Secretarias', href: '/secretarias' },
  { label: 'Notícias', href: '/noticias' },
  { label: 'Avisos', href: '/avisos' },
  { label: 'Diário Oficial', href: '/diario-oficial' },
  { label: 'Estrutura Organizacional', href: '/estrutura-organizacional' },
  { label: 'Organograma', href: '/organograma' },
  { label: 'Competências', href: '/competencias' },
  { label: 'Carta de Serviços', href: '/carta-de-servicos' }
]

const LINKS_ATENDIMENTO = [
  { label: 'Ouvidoria', href: '/ouvidoria' },
  { label: 'E-SIC', href: '/esic' },
  { label: 'Acessibilidade', href: '/acessibilidade' },
  { label: 'Perguntas Frequentes (FAQ)', href: '/faq' },
  { label: 'LGPD e Governo Digital', href: '/lgpd' }
]

function GrupoLinks({ titulo, links }: { titulo: string; links: { label: string; href: string }[] }) {
  return (
    <Card className="overflow-hidden" hoverable={false}>
      <details className="group" open>
        <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none font-semibold text-primary uppercase text-sm">
          {titulo}
          <MdExpandMore size={20} className="shrink-0 transition-transform group-open:rotate-180" />
        </summary>

        <ul className="px-5 pb-4 space-y-2">
          {links.map(link => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm text-text-secondary hover:text-primary hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </Card>
  )
}

export default function MapaDoSite() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Mapa do Site" breadcrumbItems={[{ label: 'Mapa do Site' }]} />

      <p className="text-sm text-text-muted max-w-3xl mb-8">
        Lista completa das páginas deste portal, agrupadas por assunto — útil para quem
        prefere navegar vendo tudo de uma vez, ou chegou aqui direto de uma busca externa.
      </p>

      <div className="space-y-4">
        <GrupoLinks titulo="Institucional" links={LINKS_INSTITUCIONAL} />
        <GrupoLinks titulo="Atendimento ao Cidadão" links={LINKS_ATENDIMENTO} />

        {secoesAcessoInformacao.map(secao => {
          const links = secao.itens
            .filter(item => item.href && !item.href.startsWith('http'))
            .map(item => ({ label: item.label, href: item.href as string }))

          if (links.length === 0) return null

          return <GrupoLinks key={secao.titulo} titulo={secao.titulo} links={links} />
        })}
      </div>
    </div>
  )
}
