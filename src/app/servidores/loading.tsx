import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingServidores() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Servidores" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Servidores' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    </div>
  )
}
