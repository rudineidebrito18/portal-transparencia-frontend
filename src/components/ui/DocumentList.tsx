import { MdDescription, MdFileDownload } from 'react-icons/md'

import { Documento } from '@/modules/shared/types/Documento'
import { formatarData } from '@/utils/date'
import Card from './Card'
import EmptyState from './EmptyState'

interface Props {
  documentos?: Documento[]
  emptyMessage?: string
}

export default function DocumentList({ documentos, emptyMessage = 'Nenhum documento disponível.' }: Props) {

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
          <a
            href={doc.caminhoPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
          >
            <MdFileDownload size={18} />
            Baixar
          </a>

        </Card>
      ))}

    </div>
  )
}
