import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingFiscalContrato() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Fiscal de Contrato" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Fiscal de contrato' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
