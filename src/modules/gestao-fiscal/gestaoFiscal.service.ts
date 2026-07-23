import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { gestaoFiscalMock } from './mocks/gestaoFiscal.mock'
import {
  EmpresaDividaAtiva,
  EmpresaInidonea,
  RelatorioExecucaoOrcamentaria,
  RelatorioGestaoFiscal
} from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

// Os 4 GETs abaixo agora são paginados no backend, mas nenhuma dessas telas públicas tem
// UI de paginação (nem tinha antes) — pedimos uma página grande e devolvemos .content.
export const gestaoFiscalService = {
  listarEmpresasDividaAtiva(): Promise<EmpresaDividaAtiva[]> {
    if (USE_MOCK) return gestaoFiscalMock.listarEmpresasDividaAtiva()

    return api
      .get<Page<EmpresaDividaAtiva>>('/gestao-fiscal/empresas-divida-ativa', { params: { size: 500 } })
      .then(r => r.data.content)
  },

  listarEmpresasInidoneas(): Promise<EmpresaInidonea[]> {
    if (USE_MOCK) return gestaoFiscalMock.listarEmpresasInidoneas()

    return api
      .get<Page<EmpresaInidonea>>('/gestao-fiscal/empresas-inidoneas', { params: { size: 500 } })
      .then(r => r.data.content)
  },

  listarRelatoriosExecucaoOrcamentaria(): Promise<RelatorioExecucaoOrcamentaria[]> {
    if (USE_MOCK) return gestaoFiscalMock.listarRelatoriosExecucaoOrcamentaria()

    return api
      .get<Page<RelatorioExecucaoOrcamentaria>>('/gestao-fiscal/relatorio-execucao-orcamentaria', { params: { size: 500 } })
      .then(r => r.data.content)
  },

  listarRelatoriosGestaoFiscal(): Promise<RelatorioGestaoFiscal[]> {
    if (USE_MOCK) return gestaoFiscalMock.listarRelatoriosGestaoFiscal()

    return api
      .get<Page<RelatorioGestaoFiscal>>('/gestao-fiscal/relatorios', { params: { size: 500 } })
      .then(r => r.data.content)
  }
}
