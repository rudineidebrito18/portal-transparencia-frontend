import EmptyState from '@/components/ui/EmptyState'
import { LicitacaoResumo } from '../types'
import LicitacaoCard from './LicitacaoCard'

// Server Component: renderiza a lista já resolvida pelo fetch de LicitacaoListView — não busca
// nada sozinho. Mesmo papel de DocumentoGenericoListaServidor (shared/).
interface Props {
  licitacoes: LicitacaoResumo[]
}

export default function LicitacaoListaServidor({ licitacoes }: Props) {
  return (
    <div className="grid gap-4">
      {licitacoes.length > 0 ? (
        licitacoes.map(item => (
          <LicitacaoCard key={item.id} licitacao={item} />
        ))
      ) : (
        <EmptyState message="Nenhuma licitação encontrada com os filtros aplicados." />
      )}
    </div>
  )
}
