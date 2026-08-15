import PageHeader from '@/components/PageHeader'
import EsicView from '@/modules/esic/components/EsicView'

export default function Esic() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="E-SIC" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'E-SIC' }
        ]} />

      <EsicView />
    </div>
  )
}
