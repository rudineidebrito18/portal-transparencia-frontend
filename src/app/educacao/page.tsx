import Breadcrumbs from '@/components/Breadcrumbs'
import EducacaoView from '@/modules/educacao/components/EducacaoView'

export default function Educacao() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Educação' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Educação</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <EducacaoView />
    </div>
  )
}
