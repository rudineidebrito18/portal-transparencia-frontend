import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingContrato() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: 'Contratos' }
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
          Detalhes do Contrato
        </h1>
        <div className="h-1.5 w-16 bg-secondary mt-2 rounded-full" />
      </div>

      <Skeleton className="h-96" />
    </div>
  )
}
