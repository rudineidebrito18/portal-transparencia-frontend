import EmptyState from '@/components/ui/EmptyState'
import { EdicaoDiario, ResultadoBuscaEdicaoDiario } from '../types'
import BuscaResultadoCard from './BuscaResultadoCard'
import EdicaoCard from './EdicaoCard'

interface Props {
  itens: (EdicaoDiario | ResultadoBuscaEdicaoDiario)[]
  termoAtivo: boolean
  // true quando o backend devolveu 503 (Meilisearch fora do ar) — ver DiarioOficialListView.
  // Prioridade sobre a mensagem de "nenhuma edição encontrada": itens sempre vem vazio nesse
  // caso, mas o motivo é bem diferente (indisponibilidade, não ausência de resultado).
  buscaIndisponivel?: boolean
}

// Server Component: renderiza a lista já resolvida pelo fetch de DiarioOficialListView — não
// busca nada sozinho. Discrimina pelo formato real de cada item (presença de trechoDestaque),
// mesma lógica de antes — só que aqui não existe mais o risco de race condition entre URL e
// dado (comentário do componente antigo): o fetch já resolveu por completo antes deste
// render, não tem "um frame com termoAtivo=true e dado da busca anterior" possível.
export default function EdicaoDiarioListaServidor({ itens, termoAtivo, buscaIndisponivel }: Props) {
  if (buscaIndisponivel) {
    return (
      <EmptyState message="Busca por conteúdo temporariamente indisponível. Tente novamente mais tarde ou use os filtros de tipo, número e período." />
    )
  }

  if (itens.length === 0) {
    return (
      <EmptyState
        message={termoAtivo
          ? 'Nenhuma edição encontrada com o termo buscado. Tente outra palavra-chave.'
          : 'Nenhuma edição encontrada com os filtros aplicados.'}
      />
    )
  }

  return (
    <div className="grid gap-4">
      {itens.map(item => (
        'trechoDestaque' in item
          ? <BuscaResultadoCard key={item.id} item={item as ResultadoBuscaEdicaoDiario} />
          : <EdicaoCard key={item.id} edicao={item as EdicaoDiario} />
      ))}
    </div>
  )
}
