import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingSaude() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Saúde" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Saúde' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
