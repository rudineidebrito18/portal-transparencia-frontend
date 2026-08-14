import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingRga() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Relatório de Gestão ou Atividade (RGA)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Relatório de Gestão ou Atividade (RGA)' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
