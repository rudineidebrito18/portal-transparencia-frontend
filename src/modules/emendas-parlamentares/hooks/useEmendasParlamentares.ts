'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { emendaParlamentarService } from '../emendaParlamentar.service'
import { EmendaParlamentar, FiltroEmendaParlamentar } from '../types'

export function useEmendasParlamentares() {
  return usePageableResource<EmendaParlamentar, FiltroEmendaParlamentar>({
    fetchFunction: emendaParlamentarService.listar,
    initialSort: 'dataPublicacao,desc',
    size: 10
  })
}
