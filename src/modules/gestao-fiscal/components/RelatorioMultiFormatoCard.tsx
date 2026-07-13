import { MdArticle, MdFileDownload } from 'react-icons/md'

import Card from '@/components/ui/Card'

interface Props {
  titulo: string
  subtitulo: string
  caminhoPdf?: string
  caminhoWord?: string
  caminhoXls?: string
}

export default function RelatorioMultiFormatoCard({ titulo, subtitulo, caminhoPdf, caminhoWord, caminhoXls }: Props) {
  const formatos = [
    { label: 'PDF', caminho: caminhoPdf },
    { label: 'Word', caminho: caminhoWord },
    { label: 'Excel', caminho: caminhoXls }
  ].filter(f => f.caminho)

  return (
    <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <MdArticle size={22} />
        </div>

        <div>
          <h2 className="text-base font-bold text-primary leading-tight">{titulo}</h2>
          <p className="text-sm text-text-secondary">{subtitulo}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {formatos.map(formato => (
          <a
            key={formato.label}
            href={formato.caminho}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all whitespace-nowrap"
          >
            <MdFileDownload size={16} />
            {formato.label}
          </a>
        ))}
      </div>

    </Card>
  )
}
