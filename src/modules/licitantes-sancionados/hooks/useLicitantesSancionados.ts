'use client'

import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { licitantesSancionadosService } from '../licitantesSancionados.service'

const useDocumentosLicitantesSancionados = criarUseDocumentosGenerico<'licitantes-sancionados'>(licitantesSancionadosService)

export function useLicitantesSancionados() {
  return useDocumentosLicitantesSancionados('licitantes-sancionados')
}
