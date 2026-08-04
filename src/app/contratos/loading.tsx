import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingContratos() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Contratos Administrativos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Contratos administrativos' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    </div>
  )
}
