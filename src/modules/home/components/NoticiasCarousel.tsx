'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { ConteudoInstitucional } from '@/modules/institucional/types'
import { formatarData } from '@/utils/date'

interface Props {
  noticias: ConteudoInstitucional[]
}

const INTERVALO_MS = 6000

export default function NoticiasCarousel({ noticias }: Props) {
  const [ativo, setAtivo] = useState(0)

  useEffect(() => {
    if (noticias.length <= 1) return

    const timer = setInterval(() => {
      setAtivo(prev => (prev + 1) % noticias.length)
    }, INTERVALO_MS)

    return () => clearInterval(timer)
  }, [noticias.length])

  const noticia = noticias[ativo]

  return (
    <section className="relative bg-primary-gradient text-white overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 hero-decor"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.05,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[36rem] h-[20rem] rounded-full bg-accent/15 blur-3xl hero-decor"
      />

      <div key={ativo} className="relative max-w-4xl mx-auto px-4 py-10 md:py-14 text-center animate-fade-in">
        <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-8 md:px-10 md:py-10">
          <span className="inline-block text-xs font-bold uppercase tracking-wide bg-white/15 px-3 py-1 rounded-full mb-4">
            {formatarData(noticia.data)}
          </span>

          <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-4">
            {noticia.titulo}
          </h2>

          <p className="text-white/85 text-base md:text-lg leading-relaxed line-clamp-3 mb-6">
            {noticia.texto}
          </p>

          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-primary font-semibold shadow-sm hover:bg-white/90 hover:shadow-md transition-all"
          >
            Ver todas as notícias
          </Link>
        </div>
      </div>

      {noticias.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-6">
          {noticias.map((_, i) => (
            <button
              key={i}
              onClick={() => setAtivo(i)}
              aria-label={`Ver notícia ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === ativo ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
