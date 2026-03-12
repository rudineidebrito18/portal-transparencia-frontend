import { StatusLicitacaoDescricao } from "@/interfaces/enums/StatusLicitacao"
import { TipoProcedimentoDescricao } from "@/interfaces/enums/TipoProcedimentoLicitacao"
import { Licitacao } from "@/interfaces/licitacao/Licitacao"

import { formatarMoeda } from "@/utils/currency"
import { formatarData } from "@/utils/date"

import Link from "next/link"
import { MdVisibility } from "react-icons/md"

interface Props {
  licitacao: Licitacao
}

export default function LicitacaoCard({ licitacao }: Props) {

  const corStatus = {
    EM_ABERTO: "text-accent font-semibold",
    EM_ANDAMENTO: "text-warning font-semibold",
    FINALIZADO: "text-success font-semibold",
    SUSPENSO: "text-error font-semibold",
    DESERTA: "text-neutral-dark font-semibold",
    FRACASSADA: "text-neutral-dark font-semibold",
    ANULADA: "text-error font-semibold",
    SINC_ABERTO: "text-accent-light font-semibold",
    SINC_ANDAMENTO: "text-warning font-semibold",
    INCLUIDO_SISTEMA: "text-neutral-dark font-semibold"
  }[licitacao.status]

  return (
    <div className="border border-border rounded-lg shadow-sm p-4 bg-light hover:shadow-md transition relative">

      {/* Título */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-lg font-bold text-primary">
          {TipoProcedimentoDescricao[licitacao.tipoProcedimento]} {licitacao.numeroInstrumento}/{licitacao.ano}
        </h2>
      </div>

      {/* Objeto */}
      <p className="text-sm text-text-secondary mb-4">
        {licitacao.objeto}
      </p>

      {/* Informações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-text-secondary mb-3">

        <div>
          <span className="font-semibold">Modalidade:</span>{" "}
          {TipoProcedimentoDescricao[licitacao.tipoProcedimento]}
        </div>

        <div>
          <span className="font-semibold">Abertura:</span>{" "}
          {formatarData(licitacao.dataAbertura)}
        </div>

        <div>
          <span className="font-semibold">Processo:</span>{" "}
          {licitacao.numeroProcesso}
        </div>

        <div>
          <span className="font-semibold">Valor estimado:</span>{" "}
          {licitacao.valorEstimado
            ? formatarMoeda(licitacao.valorEstimado)
            : "Não informado"}
        </div>

        <div>
          <span className="font-semibold">Status:</span>{" "}
          <span className={corStatus}>
            {StatusLicitacaoDescricao[licitacao.status]}
          </span>
        </div>

        <div>
          <span className="font-semibold">Sessão:</span>{" "}
          {formatarData(licitacao.dataSessao)}
        </div>

      </div>

      {/* Publicação */}
      <div className="text-xs text-accent-dark italic mt-2 md:absolute md:top-4 md:right-4 md:text-right">
        <p>
          Publicação: {formatarData(licitacao.dataPublicacao)}
        </p>
      </div>

      {/* Botão */}
      <div className="mt-4 flex justify-end md:absolute md:bottom-4 md:right-4">
        <Link
          href={`/licitacoes/${licitacao.id}`}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-text-primary text-sm px-4 py-2 rounded-md transition"
        >
          <MdVisibility className="w-4 h-4" />
          Acessar
        </Link>
      </div>

    </div>
  )
}