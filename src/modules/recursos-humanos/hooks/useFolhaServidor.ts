'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { folhaService } from '../folha.service'

export function useFolhaServidor(servidorId: number) {
  return useAsyncData(() => folhaService.listarPorServidor(servidorId), [servidorId], [])
}
