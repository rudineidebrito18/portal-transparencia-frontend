import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { FiltroTabelaValores, TabelaValores, TabelaValoresRequest } from './types'

const BASE = '/tabela-valores'

type ListarParams = FiltroTabelaValores & { page?: number; size?: number; sort?: string }

function montarFormData(dados: TabelaValoresRequest, arquivo?: File | null): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (arquivo) formData.append('arquivo', arquivo)
  return formData
}

// Nota: o spec OpenAPI documenta o POST/PUT daqui como `application/json`
// (igual ao bug real de assinatura ambígua do upload de documento de
// contrato de licitação) — mas testado direto via curl, é multipart normal
// (mesmo padrão de `dados`+`arquivo` do padrão genérico) e funciona certo.
// Parece só anotação errada do springdoc pra esse controller específico.
export const tabelaValoresService = {
  listar(params: ListarParams): Promise<Page<TabelaValores>> {
    return api.get<Page<TabelaValores>>(`${BASE}/buscar`, { params }).then(r => r.data)
  },

  criar(dados: TabelaValoresRequest, arquivo: File): Promise<TabelaValores> {
    return api
      .post<TabelaValores>(BASE, montarFormData(dados, arquivo), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(r => r.data)
  },

  atualizar(id: number, dados: TabelaValoresRequest, arquivo?: File | null): Promise<TabelaValores> {
    return api
      .put<TabelaValores>(`${BASE}/${id}`, montarFormData(dados, arquivo), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
