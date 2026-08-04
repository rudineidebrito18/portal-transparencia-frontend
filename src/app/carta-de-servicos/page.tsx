import PageHeader from '@/components/PageHeader'
import PdfViewer from '@/components/ui/PdfViewer'

// TODO: substituir por /pdfs/carta-de-servicos.pdf (ou equivalente) quando o arquivo
// real estiver disponível — não há endpoint de backend pra esse recurso.
const PDF_SRC = '/test.pdf'

export default function CartaDeServicos() {
  return (
    <div className="max-w-5xl mx-auto p-2">
      <PageHeader title="Carta de Serviços" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Carta de Serviços' }
        ]} />

      <p className="text-sm text-text-secondary/70 max-w-3xl mb-6">
        A Carta de Serviços ao Usuário, prevista na Lei nº 13.460/2017, informa aos
        cidadãos os serviços prestados pelo município, os requisitos, documentos e
        prazos para acessá-los, e os compromissos de qualidade no atendimento.
      </p>

      <PdfViewer src={PDF_SRC} titulo="Carta de Serviços ao Usuário" />
    </div>
  )
}
