import { notFound } from 'next/navigation'

import Breadcrumbs from '@/components/Breadcrumbs'
import ServidorDetalhe from '@/modules/recursos-humanos/components/ServidorDetalhe'
import { servidorService } from '@/modules/recursos-humanos/servidor.service'

export default async function ServidorPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isFinite(numericId)) notFound()

  let servidor
  try {
    servidor = await servidorService.buscarPorId(numericId)
  } catch (error) {
    if ((error as { status?: number }).status === 404) notFound()
    throw error
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Servidores', href: '/servidores' },
          { label: servidor.name }
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
          Detalhes do Servidor
        </h1>
        <div className="h-1.5 w-16 bg-secondary mt-2 rounded-full" />
      </div>

      <ServidorDetalhe servidor={servidor} />
    </div>
  )
}
