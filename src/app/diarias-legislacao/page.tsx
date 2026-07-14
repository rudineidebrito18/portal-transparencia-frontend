import Breadcrumbs from '@/components/Breadcrumbs'
import PdfViewer from '@/components/ui/PdfViewer'

// TODO: substituir por /pdfs/diarias-legislacao.pdf (ou equivalente) quando o
// arquivo real estiver disponível — não há endpoint de backend pra esse recurso.
const PDF_SRC = '/test.pdf'

export default function DiariasLegislacao() {
  return (
    <div className="max-w-5xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Diárias — legislação e valores' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">
        Diárias — Legislação e Valores
      </h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <PdfViewer src={PDF_SRC} titulo="Diárias — Legislação e Valores" />
    </div>
  )
}
