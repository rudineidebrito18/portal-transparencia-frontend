import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingFolhaPagamento() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Folha de Pagamento" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Folha de Pagamento' }
        ]} />

      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    </div>
  )
}
