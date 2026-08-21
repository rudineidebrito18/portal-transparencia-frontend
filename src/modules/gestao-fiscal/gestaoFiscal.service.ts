import { api } from '@/services/api'
import { urlArquivoDocumento, urlFormatoDocumento } from '@/utils/documento'
import { Page } from '@/modules/shared/types/Page'
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

type ListarParams<F> = F & { page?: number; size?: number; sort?: string }

export const gestaoFiscalService = {
  listarEmpresasDividaAtiva(params: ListarParams<FiltroEmpresaDividaAtiva>): Promise<Page<EmpresaDividaAtiva>> {
    return api
      .get<Page<EmpresaDividaAtiva>>('/gestao-fiscal/empresas-divida-ativa/filtro', { params })
      .then(r => r.data)
  },

  listarEmpresasInidoneas(params: ListarParams<FiltroEmpresaInidonea>): Promise<Page<EmpresaInidonea>> {
    return api
      .get<Page<EmpresaInidonea>>('/gestao-fiscal/empresas-inidoneas/filtro', { params })
      .then(r => r.data)
  },

  listarRelatoriosExecucaoOrcamentaria(params: ListarParams<FiltroRelatorioExecucaoOrcamentaria>): Promise<Page<RelatorioExecucaoOrcamentaria>> {
    return api
      .get<Page<RelatorioExecucaoOrcamentaria>>('/gestao-fiscal/relatorio-execucao-orcamentaria/filtro', { params })
      .then(r => r.data)
  },

  listarRelatoriosGestaoFiscal(params: ListarParams<FiltroRelatorioGestaoFiscal>): Promise<Page<RelatorioGestaoFiscal>> {
    return api
      .get<Page<RelatorioGestaoFiscal>>('/gestao-fiscal/relatorios/filtro', { params })
      .then(r => r.data)
  },

  urlArquivoEmpresaDividaAtiva(id: number): string {
    return urlArquivoDocumento('gestao-fiscal/empresas-divida-ativa', id)
  },

  urlArquivoEmpresaInidonea(id: number): string {
    return urlArquivoDocumento('gestao-fiscal/empresas-inidoneas', id)
  },

  urlFormatoRelatorioExecucaoOrcamentaria(id: number, formato: 'pdf' | 'word' | 'xls'): string {
    return urlFormatoDocumento('gestao-fiscal/relatorio-execucao-orcamentaria', id, formato)
  },

  urlFormatoRelatorioGestaoFiscal(id: number, formato: 'pdf' | 'word' | 'xls'): string {
    return urlFormatoDocumento('gestao-fiscal/relatorios', id, formato)
  }
}
