import { Licitacao } from "@/interfaces/licitacao/Licitacao";
import { api } from "./api";

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export const listarLicitacoes = async (
  queryParams: string = ""
): Promise<Page<Licitacao>> => {
  const response = await api.get(`/licitacoes?${queryParams}`);
  return response.data;
};

export const buscarLicitacao = async (id: number): Promise<Licitacao> => {
  const response = await api.get(`/licitacoes/${id}`);
  return response.data;
};