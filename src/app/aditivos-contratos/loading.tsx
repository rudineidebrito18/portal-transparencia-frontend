import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingAditivosContratos() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Aditivos de Contratos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Aditivos de Contratos' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
