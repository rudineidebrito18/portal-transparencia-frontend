import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingDiarias() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Diárias" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Diárias' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}
