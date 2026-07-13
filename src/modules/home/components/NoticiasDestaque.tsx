import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { noticiaService } from '@/modules/institucional/institucional.service'
import { ConteudoInstitucional } from '@/modules/institucional/types'
import NoticiasCarousel from './NoticiasCarousel'

export default async function NoticiasDestaque() {
  let noticias: ConteudoInstitucional[] = []
  let erro: string | null = null

  try {
    const pagina = await noticiaService.listar({ ativo: true, size: 5, sort: 'data,desc' })
    noticias = pagina.content
  } catch (e) {
    erro = e instanceof Error ? e.message : 'Erro ao carregar notícias'
  }

  if (erro) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ErrorState message={erro} />
      </div>
    )
  }

  if (noticias.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <EmptyState message="Nenhuma notícia publicada no momento." />
      </div>
    )
  }

  return <NoticiasCarousel noticias={noticias} />
}
