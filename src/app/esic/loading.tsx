import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingEsic() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="E-SIC" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'E-SIC' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  )
}
