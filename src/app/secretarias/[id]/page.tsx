import { notFound } from 'next/navigation'

import Breadcrumbs from '@/components/Breadcrumbs'
import { secretariasService } from '@/modules/secretarias/secretarias.service'
import SecretariaDetalhe from '@/modules/secretarias/components/SecretariaDetalhe'
import { SecretariaDetalhe as SecretariaDetalheType } from '@/modules/secretarias/types'

export default async function SecretariaPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isFinite(numericId)) notFound()

  let detalhe: SecretariaDetalheType
  try {
    const [unidade, decretos, documentos, exGestores, ordenadores, setores] = await Promise.all([
      secretariasService.buscarPorId(numericId),
      secretariasService.listarDecretos(numericId),
      secretariasService.listarDocumentos(numericId),
      secretariasService.listarExGestores(numericId),
      secretariasService.listarOrdenadores(numericId),
      secretariasService.listarSetores(numericId)
    ])
    detalhe = { unidade, decretos, documentos, exGestores, ordenadores, setores }
  } catch (error) {
    if ((error as { status?: number }).status === 404) notFound()
    throw error
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: 'Secretarias', href: '/secretarias' },
          { label: detalhe.unidade.nome }
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
          {detalhe.unidade.nome}
        </h1>
        <div className="h-1.5 w-16 bg-secondary mt-2 rounded-full" />
      </div>

      <SecretariaDetalhe detalhe={detalhe} />
    </div>
  )
}
