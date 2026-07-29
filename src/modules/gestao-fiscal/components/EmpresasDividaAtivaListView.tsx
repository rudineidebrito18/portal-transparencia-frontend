'use client'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import { useEmpresasDividaAtiva } from '../hooks/useGestaoFiscal'
import EmpresaDividaAtivaCard from './EmpresaDividaAtivaCard'
import EmpresaDividaAtivaFiltro from './EmpresaDividaAtivaFiltro'

export default function EmpresasDividaAtivaListView() {
  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = useEmpresasDividaAtiva()

  return (
    <div>
      <EmpresaDividaAtivaFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhuma empresa inscrita em dívida ativa encontrada."
        renderItem={empresa => <EmpresaDividaAtivaCard key={empresa.id} empresa={empresa} />}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
