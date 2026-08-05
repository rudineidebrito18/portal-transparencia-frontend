'use client'

import { useNoticias } from '../hooks/useNoticias'
import ConteudoInstitucionalListView from './ConteudoInstitucionalListView'

export default function NoticiasListView() {
  const {
    data, loading, erro, pagina, totalPaginas, totalElements, atualizadoEm,
    setPagina, ordenacao, setOrdenacao, filtros, setFiltros
  } = useNoticias()

  return (
    <ConteudoInstitucionalListView
      data={data}
      loading={loading}
      erro={erro}
      pagina={pagina}
      totalPaginas={totalPaginas}
      totalElements={totalElements}
      atualizadoEm={atualizadoEm}
      setPagina={setPagina}
      ordenacao={ordenacao}
      setOrdenacao={setOrdenacao}
      filtros={filtros}
      setFiltros={setFiltros}
      variant="noticia"
      emptyMessage="Nenhuma notícia publicada no momento."
    />
  )
}
