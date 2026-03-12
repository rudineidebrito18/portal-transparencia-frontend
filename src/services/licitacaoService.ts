import { Licitacao } from "@/interfaces/licitacao/Licitacao";
import { api } from "./api";

export const listarLicitacoes = async (): Promise<Licitacao[]> => {
  const response = await api.get("/licitacoes");
  return response.data;
};

export const buscarLicitacao = async (id: number): Promise<Licitacao> => {
  const response = await api.get(`/licitacoes/${id}`);
  return response.data;
};