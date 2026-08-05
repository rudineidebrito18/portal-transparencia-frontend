import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingCompetencias() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Competências" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Competências' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
