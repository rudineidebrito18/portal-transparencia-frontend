import Breadcrumbs from '@/components/Breadcrumbs'
import FolhaPagamentoMesView from '@/modules/recursos-humanos/components/FolhaPagamentoMesView'

export default function FolhaPagamento() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Folha de Pagamento' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Folha de Pagamento</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <FolhaPagamentoMesView />
    </div>
  )
}
