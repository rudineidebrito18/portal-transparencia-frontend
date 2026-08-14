import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingPlanoEstrategico() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Plano Estratégico Institucional (PEI)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Plano Estratégico Institucional (PEI)' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
