'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { edicaoNaoEletronicaService } from '../edicaoNaoEletronica.service'
import { EdicaoNaoEletronica, FiltroEdicaoNaoEletronica } from '../types'

export function useEdicoesNaoEletronicas() {
  return usePageableResource<EdicaoNaoEletronica, FiltroEdicaoNaoEletronica>({
    fetchFunction: edicaoNaoEletronicaService.listar,
    initialSort: 'data,desc',
    size: 10
  })
}
