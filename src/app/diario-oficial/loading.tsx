import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingDiarioOficial() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Diário Oficial" breadcrumbItems={[
          { label: 'Diário Oficial' }
        ]} />

      <Skeleton className="h-28 mb-6" />

      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
