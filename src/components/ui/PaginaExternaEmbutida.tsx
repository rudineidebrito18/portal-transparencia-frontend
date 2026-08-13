'use client'

import { useState } from 'react'
import { MdInfoOutline, MdOpenInNew } from 'react-icons/md'

interface Props {
  url: string
  titulo: string
}

// Conteúdo hospedado fora do domínio da prefeitura (governotransparente.com.br) — sem
// acesso ao DOM interno por CORS, então o fim do carregamento só pode ser detectado
// pelo próprio evento do iframe, não por fetch HEAD como o PdfViewer faz.
export default function PaginaExternaEmbutida({ url, titulo }: Props) {
  const [carregando, setCarregando] = useState(true)

  return (
    <div className="bg-white border border-border/30 rounded-2xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-border/20 text-sm">
        <span className="text-primary font-semibold truncate">{titulo}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors shrink-0"
        >
          <MdOpenInNew size={16} />
          Abrir em nova aba
        </a>
      </div>

      {/* AVISO DE CONTEÚDO EXTERNO */}
      <div className="flex items-start gap-2 px-6 py-3 bg-neutral-light/50 border-b border-border/20 text-xs text-text-secondary">
        <MdInfoOutline size={16} className="shrink-0 mt-0.5" />
        <span>Conteúdo mantido pelo Governo Transparente, exibido aqui para consulta. Não é hospedado pela Prefeitura.</span>
      </div>

      {/* IFRAME */}
      <div className="relative h-[88vh]">
        {carregando && (
          <div className="absolute inset-0 bg-neutral-light animate-pulse flex items-center justify-center text-sm text-text-muted">
            Carregando conteúdo externo...
          </div>
        )}
        <iframe
          src={url}
          title={titulo}
          className="w-full h-full block"
          onLoad={() => setCarregando(false)}
        />
      </div>

    </div>
  )
}
