import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { gestaoFiscalMock } from './mocks/gestaoFiscal.mock'
import {
  EmpresaDividaAtiva,
  EmpresaInidonea,
  FiltroEmpresaDividaAtiva,
  FiltroEmpresaInidonea,
  FiltroRelatorioExecucaoOrcamentaria,
  FiltroRelatorioGestaoFiscal,
  RelatorioExecucaoOrcamentaria,
  RelatorioGestaoFiscal
} from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams<F> = F & { page?: number; size?: number; sort?: string }

export const gestaoFiscalService = {
  listarEmpresasDividaAtiva(params: ListarParams<FiltroEmpresaDividaAtiva>): Promise<Page<EmpresaDividaAtiva>> {
    if (USE_MOCK) return gestaoFiscalMock.listarEmpresasDividaAtiva(params)

    return api
      .get<Page<EmpresaDividaAtiva>>('/gestao-fiscal/empresas-divida-ativa/filtro', { params })
      .then(r => r.data)
  },

  listarEmpresasInidoneas(params: ListarParams<FiltroEmpresaInidonea>): Promise<Page<EmpresaInidonea>> {
    if (USE_MOCK) return gestaoFiscalMock.listarEmpresasInidoneas(params)

    return api
      .get<Page<EmpresaInidonea>>('/gestao-fiscal/empresas-inidoneas/filtro', { params })
      .then(r => r.data)
  },

  listarRelatoriosExecucaoOrcamentaria(params: ListarParams<FiltroRelatorioExecucaoOrcamentaria>): Promise<Page<RelatorioExecucaoOrcamentaria>> {
    if (USE_MOCK) return gestaoFiscalMock.listarRelatoriosExecucaoOrcamentaria(params)

    return api
      .get<Page<RelatorioExecucaoOrcamentaria>>('/gestao-fiscal/relatorio-execucao-orcamentaria/filtro', { params })
      .then(r => r.data)
  },

  listarRelatoriosGestaoFiscal(params: ListarParams<FiltroRelatorioGestaoFiscal>): Promise<Page<RelatorioGestaoFiscal>> {
    if (USE_MOCK) return gestaoFiscalMock.listarRelatoriosGestaoFiscal(params)

    return api
      .get<Page<RelatorioGestaoFiscal>>('/gestao-fiscal/relatorios/filtro', { params })
      .then(r => r.data)
  }
}
