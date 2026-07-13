import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingSaude() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Saúde' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Saúde</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
