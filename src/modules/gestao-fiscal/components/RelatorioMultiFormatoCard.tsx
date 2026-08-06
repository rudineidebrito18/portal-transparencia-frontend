import Link from 'next/link'
import { MdArticle, MdFileDownload, MdVisibility } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { hrefDocumento } from '@/utils/documento'

interface Props {
  titulo: string
  subtitulo: string
  caminhoPdf?: string
  caminhoWord?: string
  caminhoXls?: string
  origem?: { label: string; href: string }
}

const classeBotao = 'flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all whitespace-nowrap'

// PDF abre na rota dedicada /documento (mesmo padrão do PdfViewer.tsx) — Word/Excel não
// têm visualizador confiável no navegador, então continuam como link de abrir/baixar normal.
export default function RelatorioMultiFormatoCard({ titulo, subtitulo, caminhoPdf, caminhoWord, caminhoXls, origem }: Props) {
  const outrosFormatos = [
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
        {caminhoPdf && (
          <Link href={hrefDocumento(caminhoPdf, titulo, { origemLabel: origem?.label, origemHref: origem?.href })} className={classeBotao}>
            <MdVisibility size={16} />
            Ver PDF
          </Link>
        )}
        {outrosFormatos.map(formato => (
          <a
            key={formato.label}
            href={formato.caminho}
            target="_blank"
            rel="noopener noreferrer"
            className={classeBotao}
          >
            <MdFileDownload size={16} />
            {formato.label}
          </a>
        ))}
      </div>

    </Card>
  )
}
