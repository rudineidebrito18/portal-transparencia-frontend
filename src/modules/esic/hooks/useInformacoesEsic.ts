'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { esicService } from '../esic.service'
import { InformacoesEsic } from '../types'

export function useInformacoesEsic() {
  return useAsyncData<InformacoesEsic | null>(() => esicService.buscarInformacoes(), [], null)
}
