import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
import { DiarioOficialInfo, EdicaoDiario, FiltroEdicaoDiario, ResultadoBuscaEdicaoDiario, ValidacaoPublicaDiario } from './types'

type ListarParams = FiltroEdicaoDiario & {
  page?: number
  size?: number
  sort?: string
}

export const diarioOficialService = {
  listar(params: ListarParams): Promise<Page<EdicaoDiario>> {
    return api
      .get<Page<EdicaoDiario>>('/edicoes/filtro', { params })
      .then(response => response.data)
  },

  // Mesmo endpoint do listar() acima, mas chamado direto do servidor (Server Component da
  // Fase 4) via backendFetch. NUNCA chamar a partir de um 'use client'.
  listarServidor(params: ListarParams): Promise<Page<EdicaoDiario>> {
    return backendFetch<Page<EdicaoDiario>>('/edicoes/filtro', { params })
  },

  // GET /edicoes/buscar-texto — busca por palavra-chave no conteúdo indexado das edições
  // (Meilisearch), combinada com os mesmos filtros estruturados de listar() (tipo/número/
  // período) — o backend não descarta o resto do filtro só porque um termo foi digitado.
  // O backend devolve 503 se o motor de busca estiver indisponível.
  buscarPorTexto(params: ListarParams): Promise<Page<ResultadoBuscaEdicaoDiario>> {
    const { termo, ...resto } = params
    return api
      .get<Page<ResultadoBuscaEdicaoDiario>>('/edicoes/buscar-texto', { params: { q: termo, ...resto } })
      .then(response => response.data)
  },

  // Mesmo endpoint do buscarPorTexto() acima, via backendFetch — usado pelo Server Component.
  // Resultado de busca por palavra-chave não vale a pena cachear por muito tempo (cada query é
  // uma combinação de URL diferente, ganho de cache seria baixo) — revalidateSegundos curto,
  // diferente do listarServidor acima (cache normal, SEO da listagem-base é o que importa ali).
  buscarPorTextoServidor(params: ListarParams): Promise<Page<ResultadoBuscaEdicaoDiario>> {
    const { termo, ...resto } = params
    return backendFetch<Page<ResultadoBuscaEdicaoDiario>>('/edicoes/buscar-texto', {
      params: { q: termo, ...resto },
      revalidateSegundos: 10
    })
  }
}

export function urlDownloadEdicao(numeroEdicao: number): string {
  return `/api/edicoes/${numeroEdicao}/download`
}

// GET /diario-oficial já é público (sem auth, confirmado via curl) — mesmo endpoint que o
// admin usa em src/modules/admin/diario-oficial/diarioOficial.service.ts, só que aqui só
// leitura (usado nas abas Quem Somos/Expediente).
export const diarioOficialInfoService = {
  buscar(): Promise<DiarioOficialInfo> {
    return api.get<DiarioOficialInfo>('/diario-oficial').then(r => r.data)
  },

  // Mesmo endpoint do buscar() acima, via backendFetch — usado pelos Server Components das
  // abas Quem Somos/Expediente.
  buscarServidor(): Promise<DiarioOficialInfo> {
    return backendFetch<DiarioOficialInfo>('/diario-oficial')
  }
}

// GET /edicoes/{numero}/validar — endpoint público já existente no backend (é o destino do
// QR Code impresso na última página de cada edição), sem consumidor no front até essa aba.
export const validacaoEdicaoService = {
  validar(numeroEdicao: number): Promise<ValidacaoPublicaDiario> {
    return api.get<ValidacaoPublicaDiario>(`/edicoes/${numeroEdicao}/validar`).then(r => r.data)
  }
}
