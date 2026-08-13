import { notFound } from 'next/navigation'

import Breadcrumbs from '@/components/Breadcrumbs'
import ContratoDetalhe from '@/modules/contratos/components/ContratoDetalhe'
import { contratoService } from '@/modules/contratos/contrato.service'
import { licitacaoService } from '@/modules/licitacoes/licitacao.service'

export default async function ContratoPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isFinite(numericId)) notFound()

  let contrato
  try {
    contrato = await contratoService.buscarPorId(numericId)
  } catch (error) {
    if ((error as { status?: number }).status === 404) notFound()
    throw error
  }

  const [documentos, aditivos] = await Promise.all([
    contratoService.listarDocumentos(numericId),
    contratoService.listarAditivos(numericId)
  ])

  // Documentos da licitação de origem, não os do contrato em si — pedido do checklist
  // original. Busca best-effort: se a licitação não puder ser carregada por qualquer
  // motivo, a página do contrato continua funcionando sem essa seção.
  const documentosLicitacao = contrato.licitacaoId
    ? await licitacaoService.buscarPorId(contrato.licitacaoId).then(l => l.documentos ?? []).catch(() => undefined)
    : undefined

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Contratos administrativos', href: '/contratos' },
          { label: `Contrato Nº ${contrato.numeroContrato}/${contrato.exercicio}` }
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
          Detalhes do Contrato
        </h1>
        <div className="h-1.5 w-16 bg-secondary mt-2 rounded-full" />
      </div>

      <ContratoDetalhe contrato={contrato} documentos={documentos} aditivos={aditivos} documentosLicitacao={documentosLicitacao} />
    </div>
  )
}
