'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { concursoService } from '../concurso.service'
import { Concurso, FiltroConcurso } from '../types'

export function useConcursos() {
  return usePageableResource<Concurso, FiltroConcurso>({
    fetchFunction: concursoService.listar,
    initialSort: 'dataAbertura,desc',
    size: 10
  })
}
