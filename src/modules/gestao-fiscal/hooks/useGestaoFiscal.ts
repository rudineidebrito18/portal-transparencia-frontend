'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { gestaoFiscalService } from '../gestaoFiscal.service'
import {
  EmpresaDividaAtiva,
  EmpresaInidonea,
  FiltroEmpresaDividaAtiva,
  FiltroEmpresaInidonea,
  FiltroRelatorioExecucaoOrcamentaria,
  FiltroRelatorioGestaoFiscal,
  RelatorioExecucaoOrcamentaria,
  RelatorioGestaoFiscal
} from '../types'

export function useEmpresasDividaAtiva() {
  return usePageableResource<EmpresaDividaAtiva, FiltroEmpresaDividaAtiva>({
    fetchFunction: gestaoFiscalService.listarEmpresasDividaAtiva,
    initialSort: 'data,desc',
    size: 10
  })
}

export function useEmpresasInidoneas() {
  return usePageableResource<EmpresaInidonea, FiltroEmpresaInidonea>({
    fetchFunction: gestaoFiscalService.listarEmpresasInidoneas,
    initialSort: 'data,desc',
    size: 10
  })
}

export function useRelatoriosExecucaoOrcamentaria() {
  return usePageableResource<RelatorioExecucaoOrcamentaria, FiltroRelatorioExecucaoOrcamentaria>({
    fetchFunction: gestaoFiscalService.listarRelatoriosExecucaoOrcamentaria,
    initialSort: 'ano,desc',
    size: 10
  })
}

export function useRelatoriosGestaoFiscal() {
  return usePageableResource<RelatorioGestaoFiscal, FiltroRelatorioGestaoFiscal>({
    fetchFunction: gestaoFiscalService.listarRelatoriosGestaoFiscal,
    initialSort: 'ano,desc',
    size: 10
  })
}
