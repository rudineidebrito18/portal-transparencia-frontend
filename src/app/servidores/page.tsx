import Breadcrumbs from '@/components/Breadcrumbs'
import ServidorListView from '@/modules/recursos-humanos/components/ServidorListView'

export default function Servidores() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Servidores' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Servidores</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <ServidorListView />
    </div>
  )
}
