'use client'

import { ComponentType } from 'react'

import { useUrlState } from '@/hooks/useUrlState'
import DocumentosClassificadosSigiloTab from './DocumentosClassificadosSigiloTab'
import EsicInformacoesTab from './EsicInformacoesTab'
import LaiTab from './LaiTab'
import SolicitacoesPublicasTab from './SolicitacoesPublicasTab'
import SolicitacoesSigilosasTab from './SolicitacoesSigilosasTab'

type Aba = 'esic' | 'publicas' | 'sigilosas' | 'documentos-sigilo' | 'lai'

const CATEGORIAS: { aba: Aba; label: string }[] = [
  { aba: 'esic', label: 'E-SIC' },
  { aba: 'publicas', label: 'Solicitações Públicas' },
  { aba: 'sigilosas', label: 'Solicitações Sigilosas' },
  { aba: 'documentos-sigilo', label: 'Documentos por Grau de Sigilo' },
  { aba: 'lai', label: 'LAI' }
]

const CONTEUDO: Record<Aba, ComponentType> = {
  esic: EsicInformacoesTab,
  publicas: SolicitacoesPublicasTab,
  sigilosas: SolicitacoesSigilosasTab,
  'documentos-sigilo': DocumentosClassificadosSigiloTab,
  lai: LaiTab
}

export default function EsicView() {
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
