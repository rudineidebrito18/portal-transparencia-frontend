import Breadcrumbs from '@/components/Breadcrumbs'
import AvisosListView from '@/modules/institucional/components/AvisosListView'

export default function AvisosPage() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Avisos' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Avisos</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <AvisosListView />
    </div>
  )
}
