import PageHeader from '@/components/PageHeader'
import NoticiasListView from '@/modules/institucional/components/NoticiasListView'

export default function NoticiasPage() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Notícias" breadcrumbItems={[
          { label: 'Notícias' }
        ]} />

      <NoticiasListView />
    </div>
  )
}
