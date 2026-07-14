'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { concursoService } from '../concurso.service'

export function useConcursos() {
  return useAsyncData(() => concursoService.listar(), [], [])
}
