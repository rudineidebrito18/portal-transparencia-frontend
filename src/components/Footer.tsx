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
      <h3 className="text-xs font-bold uppercase tracking-wide text-white/60 mb-3">{titulo}</h3>
      <ul className="space-y-2 text-sm">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="hover:underline text-white/90">
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
    <footer className="bg-primary text-white mt-10">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/60 mb-3">
            Prefeitura Municipal
          </h3>
          <p className="text-sm text-white/90 leading-relaxed">
            Prefeitura Municipal de Lago dos Rodrigues
          </p>
        </div>

        <ColunaLinks titulo="Institucional" links={LINKS_INSTITUCIONAL} />
        <ColunaLinks titulo="Serviços" links={LINKS_SERVICOS} />
        <ColunaLinks titulo="Acessibilidade" links={LINKS_ACESSIBILIDADE} />

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/60 mb-3">Contato</h3>

          {loading && (
            <div className="space-y-2">
              <div className="h-3 w-40 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-32 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-36 bg-white/20 rounded animate-pulse" />
            </div>
          )}

          {!loading && (erro || !contato) && (
            <p className="text-sm text-white/60">Informações de contato indisponíveis no momento.</p>
          )}

          {!loading && contato && (
            <ul className="space-y-2 text-sm text-white/90">
              <li className="flex items-start gap-2">
                <MdLocationOn className="shrink-0 mt-0.5" size={16} />
                <span>{contato.endereco}</span>
              </li>
              <li className="flex items-start gap-2">
                <MdSchedule className="shrink-0 mt-0.5" size={16} />
                <span>{contato.horarioAtendimento}</span>
              </li>
              <li className="flex items-center gap-2">
                <MdPhone className="shrink-0" size={16} />
                <a href={`tel:${contato.telefone}`} className="hover:underline">{contato.telefone}</a>
              </li>
              <li className="flex items-center gap-2">
                <MdEmail className="shrink-0" size={16} />
                <a href={`mailto:${contato.email}`} className="hover:underline">{contato.email}</a>
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
