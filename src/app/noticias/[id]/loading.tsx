import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingNoticia() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs items={[{ label: 'Notícias', href: '/noticias' }, { label: 'Detalhe' }]} />

      <div className="space-y-4 mt-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 sm:h-96" />
        <Skeleton className="h-24" />
      </div>
    </div>
  )
}
