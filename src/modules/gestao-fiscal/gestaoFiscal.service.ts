import { api } from '@/services/api'
import { gestaoFiscalMock } from './mocks/gestaoFiscal.mock'
import {
  EmpresaDividaAtiva,
  EmpresaInidonea,
  RelatorioExecucaoOrcamentaria,
  RelatorioGestaoFiscal
} from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const gestaoFiscalService = {
  listarEmpresasDividaAtiva(): Promise<EmpresaDividaAtiva[]> {
    if (USE_MOCK) return gestaoFiscalMock.listarEmpresasDividaAtiva()

    return api.get<EmpresaDividaAtiva[]>('/gestao-fiscal/empresas-divida-ativa').then(r => r.data)
  },

  listarEmpresasInidoneas(): Promise<EmpresaInidonea[]> {
    if (USE_MOCK) return gestaoFiscalMock.listarEmpresasInidoneas()

    return api.get<EmpresaInidonea[]>('/gestao-fiscal/empresas-inidoneas').then(r => r.data)
  },

  listarRelatoriosExecucaoOrcamentaria(): Promise<RelatorioExecucaoOrcamentaria[]> {
    if (USE_MOCK) return gestaoFiscalMock.listarRelatoriosExecucaoOrcamentaria()

    return api
      .get<RelatorioExecucaoOrcamentaria[]>('/gestao-fiscal/relatorio-execucao-orcamentaria')
      .then(r => r.data)
  },

  listarRelatoriosGestaoFiscal(): Promise<RelatorioGestaoFiscal[]> {
    if (USE_MOCK) return gestaoFiscalMock.listarRelatoriosGestaoFiscal()

    return api.get<RelatorioGestaoFiscal[]>('/gestao-fiscal/relatorios').then(r => r.data)
  }
}
