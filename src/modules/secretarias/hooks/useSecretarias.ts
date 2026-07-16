'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { secretariasService } from '../secretarias.service'

export function useSecretarias(nome: string, vigencia: string) {
  return useAsyncData(
    () => secretariasService.listar({ nome: nome || undefined, vigencia: vigencia || undefined }),
    [nome, vigencia],
    []
  )
}
