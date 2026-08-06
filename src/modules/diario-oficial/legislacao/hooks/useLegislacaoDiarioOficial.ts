'use client'

import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { legislacaoDiarioOficialService } from '../legislacao.service'

const useDocumentosLegislacaoDiarioOficial = criarUseDocumentosGenerico<'legislacao'>(legislacaoDiarioOficialService)

export function useLegislacaoDiarioOficial() {
  return useDocumentosLegislacaoDiarioOficial('legislacao')
}
