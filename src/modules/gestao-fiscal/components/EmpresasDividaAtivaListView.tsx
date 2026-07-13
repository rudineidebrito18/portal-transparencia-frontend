'use client'

import AsyncList from '@/components/ui/AsyncList'
import { useEmpresasDividaAtiva } from '../hooks/useGestaoFiscal'
import EmpresaDividaAtivaCard from './EmpresaDividaAtivaCard'

export default function EmpresasDividaAtivaListView() {
  const { data, loading, erro } = useEmpresasDividaAtiva()

  return (
    <AsyncList
      data={data}
      loading={loading}
      erro={erro}
      emptyMessage="Nenhuma empresa inscrita em dívida ativa encontrada."
      renderItem={empresa => <EmpresaDividaAtivaCard key={empresa.id} empresa={empresa} />}
    />
  )
}
