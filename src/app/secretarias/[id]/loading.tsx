import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingSecretaria() {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <Breadcrumbs items={[{ label: 'Secretarias', href: '/secretarias' }, { label: 'Detalhe' }]} />

      <div className="space-y-6 mt-4">
        <Skeleton className="h-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-56" />
      </div>
    </div>
  )
}
