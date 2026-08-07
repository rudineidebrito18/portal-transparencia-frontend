import PageHeader from '@/components/PageHeader'
import AvisosListView from '@/modules/institucional/components/AvisosListView'

export default function AvisosPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Avisos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Avisos' }
        ]} />

      <AvisosListView />
    </div>
  )
}
