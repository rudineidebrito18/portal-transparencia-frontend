'use client'

import Link from 'next/link'
import {
  MdEmail,
  MdLocationOn,
  MdPhone,
  MdSchedule
} from 'react-icons/md'

import { useInformacoesOuvidoria } from '@/modules/ouvidoria/hooks/useInformacoesOuvidoria'

const LINKS_INSTITUCIONAL = [
  { label: 'Prefeito', href: '/prefeito' },
  { label: 'Vice-Prefeito', href: '/vice-prefeito' },
  { label: 'Estrutura Organizacional', href: '/estrutura-organizacional' },
  { label: 'Organograma', href: '/organograma' },
  { label: 'Competências', href: '/competencias' },
  { label: 'Carta de Serviços', href: '/carta-de-servicos' },
  { label: 'Secretarias', href: '/secretarias' },
  { label: 'Diário Oficial', href: '/diario-oficial' },
  { label: 'Notícias', href: '/noticias' }
]

const LINKS_SERVICOS = [
  { label: 'Portal da Transparência', href: '/transparencia' },
  { label: 'Licitações', href: '/licitacoes' },
  { label: 'Contratos', href: '/contratos' },
  { label: 'Servidores', href: '/servidores' },
  { label: 'Ouvidoria', href: '/ouvidoria' },
  { label: 'E-SIC', href: '/esic' }
]

const LINKS_ACESSIBILIDADE = [
  { label: 'Acessibilidade', href: '/acessibilidade' },
  { label: 'Perguntas Frequentes', href: '/faq' },
  { label: 'LGPD e Governo Digital', href: '/lgpd' },
  { label: 'Mapa do Site', href: '/mapa-do-site' }
]

function ColunaLinks({ titulo, links }: { titulo: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wide text-white/50 mb-4">{titulo}</h3>
      <ul className="space-y-2.5 text-sm">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="text-white/85 hover:text-white transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const { data: contato, loading, erro } = useInformacoesOuvidoria()

  return (
    <footer className="relative bg-primary-gradient text-white mt-10">
      <div
        aria-hidden="true"
        className="h-1 w-full hero-decor"
        style={{ backgroundImage: 'linear-gradient(90deg, var(--color-primary-light), var(--color-secondary), var(--color-tertiary))' }}
      />

      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/50 mb-4">
            Prefeitura Municipal
          </h3>
          <p className="text-sm text-white/85 leading-relaxed">
            Prefeitura Municipal de Lago dos Rodrigues
          </p>
        </div>

        <ColunaLinks titulo="Institucional" links={LINKS_INSTITUCIONAL} />
        <ColunaLinks titulo="Serviços" links={LINKS_SERVICOS} />
        <ColunaLinks titulo="Acessibilidade" links={LINKS_ACESSIBILIDADE} />

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/50 mb-4">Contato</h3>

          {loading && (
            <div className="space-y-2.5" aria-hidden="true">
              <div className="h-3 w-40 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-32 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-36 bg-white/20 rounded animate-pulse" />
            </div>
          )}

          {!loading && (erro || !contato) && (
            <p className="text-sm text-white/60">Informações de contato indisponíveis no momento.</p>
          )}

          {!loading && contato && (
            <ul className="space-y-2.5 text-sm text-white/85">
              <li className="flex items-start gap-2">
                <MdLocationOn className="shrink-0 mt-0.5 text-accent-light" size={16} />
                <span>{contato.endereco}</span>
              </li>
              <li className="flex items-start gap-2">
                <MdSchedule className="shrink-0 mt-0.5 text-accent-light" size={16} />
                <span>{contato.horarioAtendimento}</span>
              </li>
              <li className="flex items-center gap-2">
                <MdPhone className="shrink-0 text-accent-light" size={16} />
                <a href={`tel:${contato.telefone}`} className="hover:text-white hover:underline transition-colors">{contato.telefone}</a>
              </li>
              <li className="flex items-center gap-2">
                <MdEmail className="shrink-0 text-accent-light" size={16} />
                <a href={`mailto:${contato.email}`} className="hover:text-white hover:underline transition-colors">{contato.email}</a>
              </li>
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} Prefeitura Municipal de Lago dos Rodrigues. Todos os direitos reservados.
      </div>
    </footer>
  )
}
