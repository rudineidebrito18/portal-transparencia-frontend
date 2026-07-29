'use client'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import { useEmpresasInidoneas } from '../hooks/useGestaoFiscal'
import EmpresaInidoneaCard from './EmpresaInidoneaCard'
import EmpresaInidoneaFiltro from './EmpresaInidoneaFiltro'

export default function EmpresasInidoneasListView() {
  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = useEmpresasInidoneas()

  return (
    <div>
      <EmpresaInidoneaFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhuma empresa inidônea ou suspensa encontrada."
        renderItem={empresa => <EmpresaInidoneaCard key={empresa.id} empresa={empresa} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
