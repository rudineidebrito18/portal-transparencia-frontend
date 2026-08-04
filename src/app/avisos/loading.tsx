import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingAvisos() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Avisos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Avisos' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  )
}
