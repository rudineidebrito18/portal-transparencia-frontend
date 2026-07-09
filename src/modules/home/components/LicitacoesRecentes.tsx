import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import SectionHeader from '@/components/ui/SectionHeader'
import LicitacaoCard from '@/modules/licitacoes/components/LicitacaoCard'
import { licitacaoService } from '@/modules/licitacoes/licitacao.service'
import { LicitacaoResumo } from '@/modules/licitacoes/types'

export default async function LicitacoesRecentes() {
  let licitacoes: LicitacaoResumo[] = []
  let erro: string | null = null

  try {
    const pagina = await licitacaoService.listar({ size: 3, sort: 'dataAbertura,desc' })
    licitacoes = pagina.content
  } catch (e) {
    erro = e instanceof Error ? e.message : 'Erro ao carregar licitações'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <SectionHeader title="Licitações Recentes" href="/licitacoes" linkLabel="Ver todas" />

      {erro && <ErrorState message={erro} />}

      {!erro && licitacoes.length === 0 && (
        <EmptyState message="Nenhuma licitação encontrada." />
      )}

      {!erro && licitacoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {licitacoes.map(item => (
            <LicitacaoCard key={item.id} licitacao={item} />
          ))}
        </div>
      )}
    </div>
  )
}
