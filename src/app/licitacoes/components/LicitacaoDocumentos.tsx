import { DocumentoLicitacao } from '@/interfaces/licitacao/DocumentoLicitacao'
import { formatarData } from '@/utils/date'
import { MdDescription, MdFileDownload } from 'react-icons/md'

interface Props {
  documentos?: DocumentoLicitacao[]
}

export default function LicitacaoDocumentos({ documentos }: Props) {

  if (!documentos?.length) {
    return (
      <div className="bg-white border border-border/30 rounded-xl p-6 text-center shadow-sm">
        <p className="text-sm text-text-secondary">
          Nenhum documento disponível.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {documentos.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/30 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
        >

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

        </div>
      ))}

    </div>
  )
}