import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingGestaoFiscal() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Gestão Fiscal" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Gestão Fiscal' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
