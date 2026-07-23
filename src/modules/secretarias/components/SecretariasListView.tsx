'use client'

import AsyncList from '@/components/ui/AsyncList'
import { useUrlState } from '@/hooks/useUrlState'
import { useSecretarias } from '../hooks/useSecretarias'
import { FiltroSecretaria } from '../types'
import SecretariaCard from './SecretariaCard'
import SecretariaFiltro from './SecretariaFiltro'

export default function SecretariasListView() {
  const [nome, setNome] = useUrlState<string>('nome', '')
  const [vigencia, setVigencia] = useUrlState<string>('vigencia', '')

  const { data, loading, erro } = useSecretarias(nome, vigencia)

  function aplicarFiltros(filtros: FiltroSecretaria) {
    setNome(filtros.nome ?? '')
    setVigencia(filtros.vigencia ?? '')
  }

  return (
    <div>
      <SecretariaFiltro valoresIniciais={{ nome, vigencia }} onFiltrar={aplicarFiltros} />

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhuma secretaria encontrada."
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        renderItem={unidade => <SecretariaCard key={unidade.id} unidade={unidade} />}
      />
    </div>
  )
}
