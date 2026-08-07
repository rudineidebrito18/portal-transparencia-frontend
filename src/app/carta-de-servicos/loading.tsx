import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingCartaDeServicos() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Carta de Serviços" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Carta de Serviços' }
        ]} />

      <Skeleton className="h-24" />
    </div>
  )
}
