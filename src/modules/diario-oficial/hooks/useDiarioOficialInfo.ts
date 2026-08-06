'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { diarioOficialInfoService } from '../diario-oficial.service'
import { DiarioOficialInfo } from '../types'

export function useDiarioOficialInfo() {
  return useAsyncData<DiarioOficialInfo | null>(
    () => diarioOficialInfoService.buscar(),
    [],
    null
  )
}
