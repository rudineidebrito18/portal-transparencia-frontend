'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { MdClose, MdZoomIn } from 'react-icons/md'

interface Props {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

// Miniatura clicável que abre a foto em tamanho grande sobre a página (fotos de
// gestor/secretário/prefeito costumam vir pequenas e cortadas — ajuda a ver o rosto
// direito). Reaproveitável em qualquer lugar que já use next/image com w/h fixos.
export default function FotoAmpliavel({ src, alt, width, height, className = '' }: Props) {
  const [aberta, setAberta] = useState(false)

  useEffect(() => {
    if (!aberta) return

    function fecharComEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberta(false)
    }

    document.addEventListener('keydown', fecharComEsc)
    return () => document.removeEventListener('keydown', fecharComEsc)
  }, [aberta])

  return (
    <>
      <button
        type="button"
        onClick={() => setAberta(true)}
        aria-label={`Ampliar foto — ${alt}`}
        className={`relative group shrink-0 cursor-zoom-in rounded-[inherit] ${className}`}
      >
        <Image src={src} alt={alt} width={width} height={height} className={`rounded-[inherit] object-cover ${className}`} />
        <span className="absolute inset-0 rounded-[inherit] bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <MdZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </button>

      {aberta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ampliada — ${alt}`}
          onClick={() => setAberta(false)}
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6"
        >
          <button
            type="button"
            onClick={() => setAberta(false)}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white hover:text-white/70 transition-colors"
          >
            <MdClose size={32} />
          </button>

          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full h-full max-w-2xl max-h-[80vh]"
          >
            <Image src={src} alt={alt} fill sizes="90vw" className="object-contain rounded-lg" />
          </div>
        </div>
      )}
    </>
  )
}
