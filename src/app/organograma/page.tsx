import Breadcrumbs from '@/components/Breadcrumbs'
import PdfViewer from '@/components/ui/PdfViewer'

// TODO: substituir por /pdfs/organograma.pdf (ou equivalente) quando o arquivo real
// estiver disponível — não há endpoint de backend pra esse recurso.
const PDF_SRC = '/test.pdf'

export default function Organograma() {
  return (
    <div className="max-w-5xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Organograma' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Organograma</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <PdfViewer src={PDF_SRC} titulo="Organograma" />
    </div>
  )
}
