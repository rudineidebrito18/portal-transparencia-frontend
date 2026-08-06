'use client'

import { ComponentType } from 'react'

import { useUrlState } from '@/hooks/useUrlState'
import AjudaDiarioOficial from './AjudaDiarioOficial'
import EdicoesTab from './EdicoesTab'
import EdicoesNaoEletronicasListView from './EdicoesNaoEletronicasListView'
import ExpedienteDiarioOficial from './ExpedienteDiarioOficial'
import QuemSomosDiarioOficial from './QuemSomosDiarioOficial'
import LegislacaoDiarioOficialListView from '../legislacao/components/LegislacaoDiarioOficialListView'

type Aba = 'edicoes' | 'legislacao' | 'nao-eletronicas' | 'quem-somos' | 'expediente' | 'ajuda'

const CATEGORIAS: { aba: Aba; label: string }[] = [
  { aba: 'edicoes', label: 'Edições' },
  { aba: 'legislacao', label: 'Legislação' },
  { aba: 'nao-eletronicas', label: 'Edições Não Eletrônicas' },
  { aba: 'quem-somos', label: 'Quem Somos' },
  { aba: 'expediente', label: 'Expediente' },
  { aba: 'ajuda', label: 'Ajuda' }
]

const CONTEUDO: Record<Aba, ComponentType> = {
  edicoes: EdicoesTab,
  legislacao: LegislacaoDiarioOficialListView,
  'nao-eletronicas': EdicoesNaoEletronicasListView,
  'quem-somos': QuemSomosDiarioOficial,
  expediente: ExpedienteDiarioOficial,
  ajuda: AjudaDiarioOficial
}

export default function DiarioOficialView() {
  const [aba, setAba] = useUrlState<Aba>('categoria', CATEGORIAS[0].aba)
  const Conteudo = CONTEUDO[aba]

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIAS.map(categoria => (
          <button
            key={categoria.aba}
            onClick={() => setAba(categoria.aba)}
            aria-current={aba === categoria.aba ? 'true' : undefined}
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

      <Conteudo key={aba} />
    </div>
  )
}
