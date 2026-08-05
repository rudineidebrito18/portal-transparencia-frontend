'use client'

import { ReactNode, useEffect, useState } from 'react'
import { MdClose, MdErrorOutline } from 'react-icons/md'

interface Props {
  src: string
  titulo: string
  children: ReactNode
  className?: string
}

// Uso restrito ao admin (o público usa link direto em nova guia — ver DocumentList.tsx
// e afins). Abre o arquivo num modal usando o visualizador de PDF nativo do navegador
// (mesmo <iframe> do PdfViewer.tsx). Antes de renderizar o iframe faz um HEAD pra
// confirmar que o arquivo existe — sem isso, um caminho quebrado (arquivo removido do
// disco, registro com caminho errado etc.) aparecia como um iframe em branco dentro da
// moldura do modal, parecendo bug em vez de "documento indisponível".
export default function AbrirPdf({ src, titulo, children, className }: Props) {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    if (!aberto) return

    function fecharComEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }

    document.addEventListener('keydown', fecharComEsc)
    return () => document.removeEventListener('keydown', fecharComEsc)
  }, [aberto])

  useEffect(() => {
    if (!aberto) return

    let cancelado = false
    setCarregando(true)
    setErro(false)

    fetch(src, { method: 'HEAD' })
      .then(res => {
        if (!cancelado) setErro(!res.ok)
      })
      .catch(() => {
        if (!cancelado) setErro(true)
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => { cancelado = true }
  }, [aberto, src])

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={className}>
        {children}
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
          onClick={() => setAberto(false)}
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-lg overflow-hidden w-full h-full max-w-5xl flex flex-col"
          >
            <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-border/20 shrink-0">
              <span className="text-sm font-semibold text-primary truncate">{titulo}</span>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="text-text-secondary/60 hover:text-primary transition-colors shrink-0"
              >
                <MdClose size={22} />
              </button>
            </div>

            {carregando && (
              <div className="flex-1 flex items-center justify-center text-sm text-text-secondary/60">
                Carregando documento...
              </div>
            )}

            {!carregando && erro && (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-text-secondary/70 p-6 text-center">
                <MdErrorOutline size={40} className="text-error" />
                <p className="text-sm font-semibold">Não foi possível carregar o documento.</p>
                <p className="text-xs text-text-secondary/50">O arquivo pode ter sido removido ou o caminho está incorreto.</p>
              </div>
            )}

            {!carregando && !erro && (
              <iframe src={src} title={titulo} className="flex-1 w-full" />
            )}
          </div>
        </div>
      )}
    </>
  )
}
