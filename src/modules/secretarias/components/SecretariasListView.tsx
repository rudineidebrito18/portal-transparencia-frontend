'use client'

import { useState } from 'react'

import AsyncList from '@/components/ui/AsyncList'
import { useUrlState } from '@/hooks/useUrlState'
import { useSecretarias } from '../hooks/useSecretarias'
import SecretariaCard from './SecretariaCard'

export default function SecretariasListView() {
  const [nome, setNome] = useUrlState<string>('nome', '')
  const [vigencia, setVigencia] = useUrlState<string>('vigencia', '')
  const [buscaInput, setBuscaInput] = useState(nome)

  const { data, loading, erro } = useSecretarias(nome, vigencia)

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="block text-xs font-medium mb-1 text-text-secondary/70">Buscar por nome</label>
          <input
            value={buscaInput}
            onChange={e => setBuscaInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') setNome(buscaInput)
            }}
            placeholder="Nome da secretaria/órgão..."
            className="border border-border/30 rounded-lg px-3 py-2 text-sm w-full md:w-72"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-text-secondary/70">Vigente em</label>
          <input
            type="date"
            value={vigencia}
            onChange={e => setVigencia(e.target.value)}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={() => setNome(buscaInput)}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
        >
          Buscar
        </button>
        {(nome || vigencia) && (
          <button
            onClick={() => {
              setNome('')
              setVigencia('')
              setBuscaInput('')
            }}
            className="text-sm text-primary hover:underline pb-2"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhuma secretaria encontrada."
        renderItem={unidade => <SecretariaCard key={unidade.id} unidade={unidade} />}
      />
    </div>
  )
}
