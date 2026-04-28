import LicitacaoFiltroClient from '@/app/licitacoes/components/LicitacaoFiltroClient'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function Licitacoes() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs 
        items={[
          { label: 'Licitações' }
        ]} 
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Licitações</h1>
      
      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <LicitacaoFiltroClient />
    </div>
  )
}