import { notFound } from 'next/navigation'

import Breadcrumbs from '@/components/Breadcrumbs'
import { concursoService } from '@/modules/concursos/concurso.service'
import ConcursoDetalhe from '@/modules/concursos/components/ConcursoDetalhe'

export default async function ConcursoPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isFinite(numericId)) notFound()

  let concurso
  try {
    concurso = await concursoService.buscarPorId(numericId)
  } catch (error) {
    if ((error as { status?: number }).status === 404) notFound()
    throw error
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Concursos', href: '/concursos' },
          { label: `Nº ${concurso.numero}/${concurso.ano}` }
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
          Detalhes do Concurso
        </h1>
        <div className="h-1.5 w-16 bg-secondary mt-2 rounded-full" />
      </div>

      <ConcursoDetalhe concurso={concurso} />
    </div>
  )
}
