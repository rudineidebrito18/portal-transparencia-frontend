'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { ouvidoriaService } from '../ouvidoria.service'
import { InformacoesOuvidoria } from '../types'

export function useInformacoesOuvidoria() {
  return useAsyncData<InformacoesOuvidoria | null>(() => ouvidoriaService.buscarInformacoes(), [], null)
}
