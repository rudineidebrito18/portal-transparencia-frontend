'use client'

import Link from 'next/link'
import { MdInsertDriveFile } from 'react-icons/md'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAsyncData } from '@/hooks/useAsyncData'
import { esicService } from '../esic.service'
import { LABELS_GRAU_SIGILO } from '../types'
import { formatarData } from '@/utils/date'
import { hrefDocumento } from '@/utils/documento'

// Rol de Informações Classificadas (LAI, art. 30) — nunca expõe o conteúdo do documento,
// só metadado (número, assunto, datas, grau) + link pro arquivo (declaração/registro em si).
export default function DocumentosClassificadosSigiloTab() {
  const { data: documentos, loading, erro } = useAsyncData(
    () => esicService.listarDocumentosClassificadosSigilo(),
    [],
    []
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary/70">
        Rol de documentos classificados com grau de sigilo, conforme a Lei de Acesso à Informação (art. 30).
      </p>

      {loading && (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      )}

      {!loading && erro && <ErrorState message={erro} />}

      {!loading && !erro && documentos.length === 0 && (
        <p className="text-sm text-text-secondary/70">Nenhum documento classificado registrado até o momento.</p>
      )}

      {!loading && !erro && (
        <div className="grid gap-3">
          {documentos.map(doc => (
            <Card key={doc.id} hoverable={false} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <MdInsertDriveFile size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-secondary">
                  {doc.numero && <span className="text-text-muted mr-2">{doc.numero}</span>}
                  {doc.descricao}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Publicado em {formatarData(doc.data ?? undefined)}
                  {doc.dataClassificacao && ` · Classificado em ${formatarData(doc.dataClassificacao)}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {doc.grauSigilo && (
                  <Badge className="bg-neutral-light text-text-secondary">{LABELS_GRAU_SIGILO[doc.grauSigilo]}</Badge>
                )}
                <Link
                  href={hrefDocumento(esicService.urlArquivoDocumentoClassificadoSigilo(doc.id), doc.descricao ?? 'Documento', { origemLabel: 'E-SIC', origemHref: '/esic' })}
                  className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                >
                  Ver arquivo
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
