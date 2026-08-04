import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingNoticias() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Notícias" breadcrumbItems={[
          { label: 'Notícias' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  )
}
