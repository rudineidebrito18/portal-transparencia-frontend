'use client'

import { useAvisos } from '../hooks/useAvisos'
import ConteudoInstitucionalListView from './ConteudoInstitucionalListView'

export default function AvisosListView() {
  const { data, loading, erro, pagina, totalPaginas, totalElements, atualizadoEm, setPagina, ordenacao, setOrdenacao } = useAvisos()

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
      variant="aviso"
      emptyMessage="Nenhum aviso publicado no momento."
    />
  )
}
