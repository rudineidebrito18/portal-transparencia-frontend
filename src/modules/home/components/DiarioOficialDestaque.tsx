import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import SectionHeader from '@/components/ui/SectionHeader'
import EdicaoCard from '@/modules/diario-oficial/components/EdicaoCard'
import { diarioOficialService } from '@/modules/diario-oficial/diario-oficial.service'
import { EdicaoDiario } from '@/modules/diario-oficial/types'

export default async function DiarioOficialDestaque() {
  let ultimaEdicao: EdicaoDiario | null = null
  let total = 0
  let erro: string | null = null

  try {
    const pagina = await diarioOficialService.listar({ size: 1, sort: 'dataPublicacao,desc' })
    ultimaEdicao = pagina.content[0] ?? null
    total = pagina.totalElements
  } catch (e) {
    erro = e instanceof Error ? e.message : 'Erro ao carregar o Diário Oficial'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <SectionHeader title="Diário Oficial" href="/diario-oficial" linkLabel="Ver todos" />

      {erro && <ErrorState message={erro} />}

      {!erro && !ultimaEdicao && (
        <EmptyState message="Nenhuma edição publicada ainda." />
      )}

      {!erro && ultimaEdicao && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <EdicaoCard edicao={ultimaEdicao} />
          </div>

          <Card className="p-5 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-primary">{total}</span>
            <span className="text-sm text-text-secondary mt-1">
              Total de edições publicadas
            </span>
          </Card>
        </div>
      )}
    </div>
  )
}
