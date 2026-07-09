import Breadcrumbs from '@/components/Breadcrumbs'
import NoticiasListView from '@/modules/institucional/components/NoticiasListView'

export default function NoticiasPage() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Notícias' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Notícias</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <NoticiasListView />
    </div>
  )
}
