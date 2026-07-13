'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { gestaoFiscalService } from '../gestaoFiscal.service'

export function useEmpresasDividaAtiva() {
  return useAsyncData(() => gestaoFiscalService.listarEmpresasDividaAtiva(), [], [])
}

export function useEmpresasInidoneas() {
  return useAsyncData(() => gestaoFiscalService.listarEmpresasInidoneas(), [], [])
}

export function useRelatoriosExecucaoOrcamentaria() {
  return useAsyncData(() => gestaoFiscalService.listarRelatoriosExecucaoOrcamentaria(), [], [])
}

export function useRelatoriosGestaoFiscal() {
  return useAsyncData(() => gestaoFiscalService.listarRelatoriosGestaoFiscal(), [], [])
}
