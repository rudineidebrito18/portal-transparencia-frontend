import Card from '@/components/ui/Card'

export interface TermoGlossario {
  sigla: string
  titulo: string
  descricao: string
}

// Aba explicativa reutilizável (inspirada em Bom Lugar, aba "Vamos entender um pouco?") —
// traduz siglas técnicas (RREO, RGF, PPA...) em linguagem simples, sem exigir download de
// PDF. Usado por Gestão Fiscal e Planejamento; qualquer outro módulo com o mesmo problema
// de siglas pode reaproveitar.
export default function GlossarioTermos({ termos }: { termos: TermoGlossario[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {termos.map(termo => (
        <Card key={termo.sigla} className="p-5" hoverable={false}>
          <p className="text-xs font-bold uppercase text-primary mb-1">{termo.sigla}</p>
          <p className="text-sm font-semibold text-text-secondary mb-2">{termo.titulo}</p>
          <p className="text-sm text-text-secondary/70 leading-relaxed">{termo.descricao}</p>
        </Card>
      ))}
    </div>
  )
}
