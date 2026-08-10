import Link from 'next/link'
import { MdArrowForward, MdDescription, MdGavel, MdHeadsetMic } from 'react-icons/md'

import Card from '@/components/ui/Card'

const ACOES_RAPIDAS = [
  {
    label: 'Portal da Transparência',
    href: '/transparencia',
    descricao: 'Despesas, receitas, servidores e mais',
    icone: MdDescription,
    gradiente: 'from-primary to-primary-light',
  },
  {
    label: 'Licitações e Contratos',
    href: '/licitacoes',
    descricao: 'Editais, resultados e contratos vigentes',
    icone: MdGavel,
    gradiente: 'from-secondary to-secondary-light',
  },
  {
    label: 'Ouvidoria e E-SIC',
    href: '/ouvidoria',
    descricao: 'Fale com a Prefeitura e peça informações',
    icone: MdHeadsetMic,
    gradiente: 'from-tertiary to-tertiary-light',
  },
]

// Banda de identidade + navegação rápida acima do carrossel de notícias (que já
// funciona como destaque dinâmico, mas depende de haver notícia publicada — sem essa
// banda, um visitante novo caindo direto na home não tinha nenhum "onde estou / o que
// posso fazer aqui" fixo).
//
// Corte diagonal (clip-path) só na camada de fundo, nunca no wrapper de conteúdo — os
// cards de acesso rápido "flutuam" por cima da borda via margem negativa, por isso
// ganham tratamento glass (fundo real por baixo, justifica o efeito). É a única
// diagonal do site de propósito: um gesto de assinatura na porta de entrada, não um
// padrão repetido em toda seção (isso pareceria template). Os 3 blobs do "mesh" usam as
// 3 cores de marca (primary/secondary/tertiary) — não é decoração aleatória, é a
// própria paleta amarrando o momento mais visível da Home.
export default function Hero() {
  return (
    <section className="relative bg-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-primary-gradient overflow-hidden hero-decor"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)' }}
      >
        <div className="absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full bg-accent/25 blur-3xl animate-blob-drift-a" />
        <div className="absolute top-1/3 -left-16 w-80 h-80 rounded-full bg-tertiary/20 blur-3xl animate-blob-drift-b" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-secondary/15 blur-3xl animate-blob-drift-a" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-14 md:pt-20 pb-28 md:pb-36">
        <span className="inline-block text-xs font-bold uppercase tracking-wide text-white bg-white/15 px-3 py-1 rounded-full mb-5">
          Prefeitura Municipal de Lago dos Rodrigues
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-white max-w-2xl mb-5">
          <span className="text-gradient-brand">Transparência</span> e acesso à
          informação pública
        </h1>

        <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-xl">
          Acompanhe despesas, receitas, licitações, contratos e a folha de pagamento do
          município de forma simples, aberta e acessível a todos os cidadãos.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 -mt-16 md:-mt-20 pb-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {ACOES_RAPIDAS.map(({ label, href, descricao, icone: Icone, gradiente }) => (
            <Link key={href} href={href} className="block h-full rounded-xl">
              <Card glass className="h-full p-5 flex items-start gap-3">
                <span
                  className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${gradiente} text-white shadow-sm flex items-center justify-center`}
                >
                  <Icone size={22} aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    {label}
                    <MdArrowForward size={14} aria-hidden="true" />
                  </span>
                  <span className="block text-sm text-text-muted mt-0.5">{descricao}</span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
