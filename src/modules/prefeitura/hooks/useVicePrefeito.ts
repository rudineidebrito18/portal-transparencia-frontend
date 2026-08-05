'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { vicePrefeitoService } from '../prefeitura.service'
import { Autoridade } from '../types'

export function useVicePrefeito() {
  return useAsyncData<Autoridade | null>(() => vicePrefeitoService.buscar(), [], null)
}
