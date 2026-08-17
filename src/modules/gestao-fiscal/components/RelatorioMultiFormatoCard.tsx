import Link from 'next/link'
import { MdArticle, MdFileDownload, MdVisibility } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { hrefDocumento } from '@/utils/documento'

interface Props {
  titulo: string
  subtitulo: string
  temPdf?: boolean
  temWord?: boolean
  temXls?: boolean
  urlPdf: string
  urlWord: string
  urlXls: string
  origem?: { label: string; href: string }
}

const classeBotao = 'flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all whitespace-nowrap'

// PDF abre na rota dedicada /documento (mesmo padrão do PdfViewer.tsx) — Word/Excel não
// têm visualizador confiável no navegador, então continuam como link de abrir/baixar normal.
// urlPdf/urlWord/urlXls vêm sempre prontas do chamador (urlFormatoDocumento) — os
// booleanos temPdf/temWord/temXls é que decidem se o botão aparece, nunca o valor da URL.
export default function RelatorioMultiFormatoCard({ titulo, subtitulo, temPdf = true, temWord = true, temXls = true, urlPdf, urlWord, urlXls, origem }: Props) {
  const outrosFormatos = [
    { label: 'Word', caminho: temWord ? urlWord : undefined },
    { label: 'Excel', caminho: temXls ? urlXls : undefined }
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
        {temPdf && (
          <Link href={hrefDocumento(urlPdf, titulo, { origemLabel: origem?.label, origemHref: origem?.href })} className={classeBotao}>
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
