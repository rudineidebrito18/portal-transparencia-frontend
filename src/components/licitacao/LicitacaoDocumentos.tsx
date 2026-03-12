import { DocumentoLicitacao } from '@/interfaces/licitacao/DocumentoLicitacao'
import { formatarData } from '@/utils/date'
import { MdFileDownload } from 'react-icons/md'

interface Props {
  documentos?: DocumentoLicitacao[]
}

export default function LicitacaoDocumentos({ documentos }: Props) {

  if (!documentos?.length) {
    return (
      <p className="text-sm text-text-secondary">
        Nenhum documento disponível.
      </p>
    )
  }

  return (
    <ul className="space-y-2">

      {documentos.map((doc) => (

        <li
          key={doc.id}
          className="flex items-center justify-between bg-neutral p-3 rounded border border-border"
        >

          <div className="flex flex-col">

            <span className="text-sm font-medium text-text-primary">
              {doc.assunto}
            </span>

            <span className="text-xs text-text-secondary">
              {doc.tipoDocumento} • {formatarData(doc.dataEnvio)}
            </span>

          </div>

          <a
            href={doc.caminhoPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:text-primary-light"
          >
            <MdFileDownload />
            <span className="text-sm">
              Baixar
            </span>
          </a>

        </li>

      ))}

    </ul>
  )
}