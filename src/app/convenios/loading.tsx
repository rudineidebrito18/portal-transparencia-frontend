import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingConvenios() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Convênios e Transferências" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Convênios e Transferências' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
