'use client'

import { ComponentType } from 'react'

import { useUrlState } from '@/hooks/useUrlState'
import AcordosFirmadosListView from './AcordosFirmadosListView'
import TransferenciasRealizadasListView from './TransferenciasRealizadasListView'
import TransferenciasRecebidasListView from './TransferenciasRecebidasListView'

type Aba = 'transferencias-recebidas' | 'transferencias-realizadas' | 'acordos-firmados'

const CATEGORIAS: { aba: Aba; label: string }[] = [
  { aba: 'transferencias-recebidas', label: 'Transferências Recebidas' },
  { aba: 'transferencias-realizadas', label: 'Transferências Realizadas' },
  { aba: 'acordos-firmados', label: 'Acordos Firmados pelo Órgão' }
]

const CONTEUDO: Record<Aba, ComponentType> = {
  'transferencias-recebidas': TransferenciasRecebidasListView,
  'transferencias-realizadas': TransferenciasRealizadasListView,
  'acordos-firmados': AcordosFirmadosListView
}

export default function ConveniosView() {
  const [aba, setAba] = useUrlState<Aba>('categoria', CATEGORIAS[0].aba)
  const Conteudo = CONTEUDO[aba]

  return (
    <div>
      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIAS.map(categoria => (
          <button
            key={categoria.aba}
            onClick={() => setAba(categoria.aba)}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all
              ${aba === categoria.aba
                ? 'bg-primary text-white shadow-md'
                : 'bg-neutral-light text-text-secondary hover:bg-primary/10'
              }`}
          >
            {categoria.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <Conteudo key={aba} />
    </div>
  )
}
