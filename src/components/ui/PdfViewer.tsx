'use client'

import { useEffect, useState } from 'react'
import { MdErrorOutline, MdPictureAsPdf } from 'react-icons/md'

interface Props {
  src: string
  titulo: string
}

// Sem botão de download próprio de propósito — o iframe renderiza o visualizador de PDF
// nativo do navegador (thumbnails, zoom, paginação), que já tem download/impressão na
// própria barra de ferramentas dele. Um segundo botão aqui seria redundante. Antes de
// montar o iframe confirma com um HEAD que o arquivo existe — sem isso um caminho
// quebrado deixava um quadro em branco em vez de um erro explícito.
export default function PdfViewer({ src, titulo }: Props) {
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro(false)

    fetch(src, { method: 'HEAD' })
      .then(res => { if (!cancelado) setErro(!res.ok) })
      .catch(() => { if (!cancelado) setErro(true) })
      .finally(() => { if (!cancelado) setCarregando(false) })

    return () => { cancelado = true }
  }, [src])

  return (
    <div className="bg-white border border-border/30 rounded-2xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border/20 text-primary font-semibold text-sm">
        <MdPictureAsPdf size={20} />
        {titulo}
      </div>

      {/* VISUALIZADOR */}
      {carregando && (
        <div className="h-[80vh] flex items-center justify-center text-sm text-text-secondary/60">
          Carregando documento...
        </div>
      )}

      {!carregando && erro && (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-2 text-text-secondary/70 p-6 text-center">
          <MdErrorOutline size={40} className="text-error" />
          <p className="text-sm font-semibold">Não foi possível carregar o documento.</p>
          <p className="text-xs text-text-secondary/50">O arquivo pode ter sido removido ou o caminho está incorreto.</p>
        </div>
      )}

      {!carregando && !erro && (
        <iframe src={src} title={titulo} className="w-full h-[80vh] block" />
      )}

    </div>
  )
}
