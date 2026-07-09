import { MdNewspaper } from 'react-icons/md'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import SectionHeader from '@/components/ui/SectionHeader'
import ConteudoInstitucionalCard from '@/modules/institucional/components/ConteudoInstitucionalCard'
import { noticiaService } from '@/modules/institucional/institucional.service'
import { ConteudoInstitucional } from '@/modules/institucional/types'
import { formatarData } from '@/utils/date'

export default async function NoticiasDestaque() {
  let noticias: ConteudoInstitucional[] = []
  let erro: string | null = null

  try {
    const pagina = await noticiaService.listar({ ativo: true, size: 5, sort: 'data,desc' })
    noticias = pagina.content
  } catch (e) {
    erro = e instanceof Error ? e.message : 'Erro ao carregar notícias'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <SectionHeader title="Notícias em Destaque" href="/noticias" linkLabel="Ver todas" />

      {erro && <ErrorState message={erro} />}

      {!erro && noticias.length === 0 && (
        <EmptyState message="Nenhuma notícia publicada no momento." />
      )}

      {!erro && noticias.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* DESTAQUE */}
          <Card className="p-6 flex flex-col gap-3 self-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <MdNewspaper size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary leading-tight">
                  {noticias[0].titulo}
                </h3>
                <p className="text-xs text-text-secondary/60 mt-1">
                  {formatarData(noticias[0].data)}
                </p>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed line-clamp-6">
              {noticias[0].texto}
            </p>
          </Card>

          {/* LISTA */}
          <div className="grid gap-3">
            {noticias.slice(1, 5).map(item => (
              <ConteudoInstitucionalCard key={item.id} item={item} variant="noticia" compact />
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
