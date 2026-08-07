import { notFound } from 'next/navigation'

import Breadcrumbs from '@/components/Breadcrumbs'
import ImagemCarrossel from '@/components/ui/ImagemCarrossel'
import { formatarData } from '@/utils/date'
import { noticiaService } from '@/modules/institucional/institucional.service'
import { imagensOrdenadas } from '@/modules/institucional/utils'

export default async function NoticiaDetalhePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isFinite(numericId)) notFound()

  let noticia
  try {
    noticia = await noticiaService.buscarPorId(numericId)
  } catch (error) {
    if ((error as { status?: number }).status === 404) notFound()
    throw error
  }

  // Notícia inativa não tem página própria pro público — mesmo tratamento de "não
  // encontrado" usado em outros detalhes públicos (ex: Secretaria).
  if (!noticia.ativo) notFound()

  const imagens = imagensOrdenadas(noticia)

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs items={[{ label: 'Notícias', href: '/noticias' }, { label: noticia.titulo }]} />

      <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
        {noticia.titulo}
      </h1>
      <p className="text-sm text-text-secondary/60 mt-2">{formatarData(noticia.data)}</p>
      <div className="h-1.5 w-16 bg-secondary mt-3 mb-6 rounded-full" />

      {imagens.length > 0 && (
        <ImagemCarrossel imagens={imagens} alt={noticia.titulo} className="h-64 sm:h-96 rounded-xl mb-6" />
      )}

      <p className="text-base text-text-secondary leading-relaxed whitespace-pre-line">
        {noticia.texto}
      </p>
    </div>
  )
}
