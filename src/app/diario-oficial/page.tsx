import Breadcrumbs from '@/components/Breadcrumbs'
import DiarioOficialListView from '@/modules/diario-oficial/components/DiarioOficialListView'

export default function DiarioOficialPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Diário Oficial' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Diário Oficial</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <DiarioOficialListView />
    </div>
  )
}
