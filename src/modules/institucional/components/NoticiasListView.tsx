'use client'

import { useNoticias } from '../hooks/useNoticias'
import ConteudoInstitucionalListView from './ConteudoInstitucionalListView'

export default function NoticiasListView() {
  const { data, loading, erro, pagina, totalPaginas, setPagina } = useNoticias()

  return (
    <ConteudoInstitucionalListView
      data={data}
      loading={loading}
      erro={erro}
      pagina={pagina}
      totalPaginas={totalPaginas}
      setPagina={setPagina}
      variant="noticia"
      emptyMessage="Nenhuma notícia publicada no momento."
    />
  )
}
