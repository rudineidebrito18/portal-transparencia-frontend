import EmptyState from '@/components/ui/EmptyState'
import { ConteudoInstitucional } from '../types'
import ConteudoInstitucionalCard from './ConteudoInstitucionalCard'

// Server Component: renderiza a lista já resolvida pelo fetch do NoticiasListView — não busca
// nada sozinho. Mesmo papel de DocumentoGenericoListaServidor (shared/), mas pro card de
// ConteudoInstitucional (imagem + resumo + link "Ver detalhes"), não o card de documento genérico.
interface Props {
  itens: ConteudoInstitucional[]
  variant: 'noticia' | 'aviso'
  emptyMessage: string
}

export default function ConteudoInstitucionalListaServidor({ itens, variant, emptyMessage }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {itens.length > 0 ? (
        itens.map(item => (
          <ConteudoInstitucionalCard key={item.id} item={item} variant={variant} />
        ))
      ) : (
        <EmptyState message={emptyMessage} className="col-span-full" />
      )}
    </div>
  )
}
