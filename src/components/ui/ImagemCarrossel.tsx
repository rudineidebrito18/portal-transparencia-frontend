'use client'

import { useState } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import FotoAmpliavel from './FotoAmpliavel'

interface Imagem {
  id: number
  url: string
}

interface Props {
  imagens: Imagem[]
  alt: string
  className?: string
}

// Reaproveitável em qualquer lugar com N imagens de um mesmo item — hoje só
// Notícias tem isso, mas não é específico dela. Cada slide usa FotoAmpliavel (lightbox
// já existente no projeto) — as setas/dots ficam por cima como irmãos, não filhos, do
// botão do FotoAmpliavel, então não interferem no zoom nem propagam clique pra um
// eventual <Link> que envolva o card inteiro.
export default function ImagemCarrossel({ imagens, alt, className = 'h-40' }: Props) {
  const [indice, setIndice] = useState(0)

  if (imagens.length === 0) return null

  const atual = imagens[indice]

  function anterior() {
    setIndice(i => (i === 0 ? imagens.length - 1 : i - 1))
  }

  function proxima() {
    setIndice(i => (i === imagens.length - 1 ? 0 : i + 1))
  }

  return (
    <div className={`relative group/carrossel ${className}`}>
      <FotoAmpliavel
        key={atual.id}
        src={atual.url}
        alt={alt}
        width={800}
        height={450}
        className={`w-full ${className} object-cover`}
      />

      {imagens.length > 1 && (
        <>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); anterior() }}
            aria-label="Imagem anterior"
            className="absolute z-10 left-1.5 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-70 md:opacity-0 md:group-hover/carrossel:opacity-100 transition-opacity"
          >
            <MdChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); proxima() }}
            aria-label="Próxima imagem"
            className="absolute z-10 right-1.5 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-70 md:opacity-0 md:group-hover/carrossel:opacity-100 transition-opacity"
          >
            <MdChevronRight size={18} />
          </button>

          <div className="absolute z-10 bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {imagens.map((imagem, i) => (
              <button
                key={imagem.id}
                type="button"
                onClick={e => { e.stopPropagation(); setIndice(i) }}
                aria-label={`Ver imagem ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === indice ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
