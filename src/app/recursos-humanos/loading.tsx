import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingRecursosHumanos() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Recursos Humanos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Recursos Humanos' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
