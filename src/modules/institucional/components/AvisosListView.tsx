'use client'

import { useAvisos } from '../hooks/useAvisos'
import ConteudoInstitucionalListView from './ConteudoInstitucionalListView'

export default function AvisosListView() {
  const { data, loading, erro, pagina, totalPaginas, setPagina } = useAvisos()

  return (
    <ConteudoInstitucionalListView
      data={data}
      loading={loading}
      erro={erro}
      pagina={pagina}
      totalPaginas={totalPaginas}
      setPagina={setPagina}
      variant="aviso"
      emptyMessage="Nenhum aviso publicado no momento."
    />
  )
}
