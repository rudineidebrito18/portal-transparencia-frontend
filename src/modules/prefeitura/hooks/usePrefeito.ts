'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { prefeitoService } from '../prefeitura.service'
import { Autoridade } from '../types'

export function usePrefeito() {
  return useAsyncData<Autoridade | null>(() => prefeitoService.buscar(), [], null)
}
