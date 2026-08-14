import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingLoa() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Lei Orçamentária Anual (LOA)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Lei Orçamentária Anual (LOA)' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
