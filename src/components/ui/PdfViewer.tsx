import { MdPictureAsPdf } from 'react-icons/md'

interface Props {
  src: string
  titulo: string
}

// Sem botão de download próprio de propósito — o iframe renderiza o visualizador de PDF
// nativo do navegador (thumbnails, zoom, paginação), que já tem download/impressão na
// própria barra de ferramentas dele. Um segundo botão aqui seria redundante.
export default function PdfViewer({ src, titulo }: Props) {
  return (
    <div className="bg-white border border-border/30 rounded-2xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border/20 text-primary font-semibold text-sm">
        <MdPictureAsPdf size={20} />
        {titulo}
      </div>

      {/* VISUALIZADOR */}
      <iframe src={src} title={titulo} className="w-full h-[80vh] block" />

    </div>
  )
}
