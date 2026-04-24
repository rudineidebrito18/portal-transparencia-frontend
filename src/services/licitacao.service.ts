import { FiltroLicitacao, Licitacao } from "@/interfaces/licitacao/Licitacao"
import { listarLicitacoesMock } from '@/mocks/licitacao/licitacao.mock'
import { licitacoesMock } from "@/mocks/licitacao/licitacaoMock"
import { Page } from "@/types/Page"
import { api } from "./api"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK

export const listarLicitacoes = async (
  params: FiltroLicitacao & {
    page?: number
    size?: number
    sort?: string
  }
): Promise<Page<Licitacao>> => {

  if (USE_MOCK) {
    return listarLicitacoesMock(params)
  }

  try {
    const response = await api.get<Page<Licitacao>>("/licitacoes", {
      params
    })

    return response.data

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn(error.message)
    } else {
      console.warn("API falhou, usando mock automaticamente")
    }

    return listarLicitacoesMock(params)
  }
}

export const buscarLicitacao = async (id: number): Promise<Licitacao> => {
  if (USE_MOCK) {
    const item = licitacoesMock.find(l => l.id === id);
    if (!item) throw new Error("Licitação não encontrada (mock)");
    return item;
  }

  try {
    const response = await api.get<Licitacao>(`/licitacoes/${id}`);
    return response.data;
    
  } catch (error) {
    const item = licitacoesMock.find(l => l.id === id);
    if (item) {
      return item;
    }
    if (error instanceof Error) {
      throw new Error(`Erro ao buscar licitação: ${error.message}`);
    }
    throw new Error("Erro desconhecido e item não encontrado no mock.");
  }
}
