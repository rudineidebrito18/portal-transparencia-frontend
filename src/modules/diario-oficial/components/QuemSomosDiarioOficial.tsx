import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import { diarioOficialInfoService } from '../diario-oficial.service'

// Fase 4: Server Component — fetch único, sem paginação/filtro, então sem estado de URL
// nenhum (diferente dos módulos com listagem). Antes era client-side (useDiarioOficialInfo +
// useAsyncData); convertido direto porque não tinha nenhuma interatividade real.
export default async function QuemSomosDiarioOficial() {
  const info = await diarioOficialInfoService.buscarServidor()

  if (!info?.quemSomos) return <EmptyState message="Ainda não há um texto de apresentação cadastrado." />

  return (
    <Card className="p-6" hoverable={false}>
      <h2 className="text-base font-bold text-primary mb-3">{info.name}</h2>
      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
        {info.quemSomos}
      </p>
    </Card>
  )
}
