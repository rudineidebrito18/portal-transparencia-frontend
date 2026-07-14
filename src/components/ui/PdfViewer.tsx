import { MdFileDownload, MdPictureAsPdf } from 'react-icons/md'

interface Props {
  src: string
  titulo: string
}

export default function PdfViewer({ src, titulo }: Props) {
  return (
    <div className="bg-white border border-border/30 rounded-2xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <MdPictureAsPdf size={20} />
          {titulo}
        </div>

        <a
          href={src}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
        >
          <MdFileDownload size={18} />
          Baixar PDF
        </a>
      </div>

      {/* VISUALIZADOR */}
      <iframe src={src} title={titulo} className="w-full h-[80vh] block" />

    </div>
  )
}
