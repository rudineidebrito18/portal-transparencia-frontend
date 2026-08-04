import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingCargos() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Tabela com Padrão Remuneratório" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Tabela com padrão remuneratório' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    </div>
  )
}
