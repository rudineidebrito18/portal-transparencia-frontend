'use client'

import AsyncList from '@/components/ui/AsyncList'
import { useEmpresasInidoneas } from '../hooks/useGestaoFiscal'
import EmpresaInidoneaCard from './EmpresaInidoneaCard'

export default function EmpresasInidoneasListView() {
  const { data, loading, erro } = useEmpresasInidoneas()

  return (
    <AsyncList
      data={data}
      loading={loading}
      erro={erro}
      emptyMessage="Nenhuma empresa inidônea ou suspensa encontrada."
      renderItem={empresa => <EmpresaInidoneaCard key={empresa.id} empresa={empresa} />}
    />
  )
}
