'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { obraService } from '../obra.service'

export function useObras() {
  return useAsyncData(() => obraService.listar(), [], [])
}
