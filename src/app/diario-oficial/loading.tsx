import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingDiarioOficial() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Diário Oficial' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Diário Oficial</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
