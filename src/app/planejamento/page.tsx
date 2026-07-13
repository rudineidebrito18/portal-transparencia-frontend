import Breadcrumbs from '@/components/Breadcrumbs'
import PlanejamentoView from '@/modules/planejamento/components/PlanejamentoView'

export default function Planejamento() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Planejamento' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Planejamento</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <PlanejamentoView />
    </div>
  )
}
