import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { EmpresaInidonea, EmpresaInidoneaRequest, FiltroEmpresaInidonea } from './types'

const BASE = '/gestao-fiscal/empresas-inidoneas'

type ListarParams = FiltroEmpresaInidonea & { page?: number; size?: number; sort?: string }

function montarFormData(dados: EmpresaInidoneaRequest, pdf?: File | null): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (pdf) formData.append('pdf', pdf)
  return formData
}

// Sem PUT no backend — só criar/listar/excluir.
export const empresaInidoneaService = {
  listar(params: ListarParams): Promise<Page<EmpresaInidonea>> {
    return api.get<Page<EmpresaInidonea>>(`${BASE}/filtro`, { params }).then(r => r.data)
  },

  criar(dados: EmpresaInidoneaRequest, pdf?: File | null): Promise<EmpresaInidonea> {
    return api
      .post<EmpresaInidonea>(BASE, montarFormData(dados, pdf), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
