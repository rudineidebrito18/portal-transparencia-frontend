import Link from 'next/link'
import { MdDescription, MdVisibility } from 'react-icons/md'

import { Documento } from '@/modules/shared/types/Documento'
import { formatarData } from '@/utils/date'
import { hrefDocumento } from '@/utils/documento'
import Card from './Card'
import EmptyState from './EmptyState'

interface Props {
  documentos?: Documento[]
  emptyMessage?: string
  origem?: { label: string; href: string }
  // Cada chamador monta a URL de download do seu jeito (bases/IDs aninhados diferentes —
  // ver urlArquivoDocumento em utils/documento.ts) — o componente nunca deve usar
  // doc.caminhoPdf como URL, é só o path interno de armazenamento vindo da API.
  urlArquivo: (doc: Documento) => string
}

export default function DocumentList({ documentos, emptyMessage = 'Nenhum documento disponível.', origem, urlArquivo }: Props) {

  if (!documentos?.length) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="space-y-3">

      {documentos.map((doc) => (
        <Card key={doc.id} className="flex items-center justify-between gap-4 p-4">

          {/* INFO */}
          <div className="flex items-start gap-3">

            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MdDescription size={18} />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-secondary">
                {doc.assunto}
              </span>

              <span className="text-xs text-text-secondary/70">
                {doc.tipoDocumento} • {formatarData(doc.dataEnvio)}
              </span>
            </div>

          </div>

          {/* BOTÃO */}
          <Link
            href={hrefDocumento(urlArquivo(doc), doc.assunto, { origemLabel: origem?.label, origemHref: origem?.href })}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
          >
            <MdVisibility size={18} />
            Ver documento
          </Link>

        </Card>
      ))}

    </div>
  )
}
