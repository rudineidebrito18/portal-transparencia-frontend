import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingLicitantesContratados() {
  return (
    <div className="max-w-5xl mx-auto p-2">
      <PageHeader title="Relação de Licitantes Contratados" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Relação de Licitantes Contratados' }
        ]} />

      <Skeleton className="h-[80vh]" />
    </div>
  )
}
