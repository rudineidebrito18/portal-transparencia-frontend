import EmptyState from '@/components/ui/EmptyState'
import { DocumentoGenerico } from '../../types/DocumentoGenerico'
import DocumentoGenericoCard from './DocumentoGenericoCard'

// Server Component (sem 'use client'): renderiza a lista já resolvida pelo fetch do
// DocumentoGenericoListView de cada módulo — não busca nada sozinho.
interface Props {
  documentos: DocumentoGenerico[]
  origem?: { label: string; href: string }
  urlArquivo: (id: number) => string
}

export default function DocumentoGenericoListaServidor({ documentos, origem, urlArquivo }: Props) {
  if (documentos.length === 0) {
    return <EmptyState message="Nenhum documento encontrado com os filtros aplicados." />
  }

  return (
    <div className="grid gap-4">
      {documentos.map(item => (
        <DocumentoGenericoCard key={item.id} documento={item} origem={origem} urlArquivo={urlArquivo(item.id)} />
      ))}
    </div>
  )
}
