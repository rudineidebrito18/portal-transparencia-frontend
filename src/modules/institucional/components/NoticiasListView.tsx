'use client'

import { useNoticias } from '../hooks/useNoticias'
import ConteudoInstitucionalListView from './ConteudoInstitucionalListView'

export default function NoticiasListView() {
  const { data, loading, erro, pagina, totalPaginas, totalElements, setPagina, ordenacao, setOrdenacao } = useNoticias()

  return (
    <ConteudoInstitucionalListView
      data={data}
      loading={loading}
      erro={erro}
      pagina={pagina}
      totalPaginas={totalPaginas}
      totalElements={totalElements}
      setPagina={setPagina}
      ordenacao={ordenacao}
      setOrdenacao={setOrdenacao}
      variant="noticia"
      emptyMessage="Nenhuma notícia publicada no momento."
    />
  )
}
