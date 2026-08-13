import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingExecucaoOrcamentaria2025a2026() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Execução Orçamentária (2025 a 2026)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Execução Orçamentária (2025 a 2026)' }
        ]} />

      <Skeleton className="h-[88vh]" />
    </div>
  )
}
