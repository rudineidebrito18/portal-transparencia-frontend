import { StatusLicitacao, StatusLicitacaoDescricao } from "@/interfaces/enums/StatusLicitacao"
import { TipoProcedimentoDescricao, TipoProcedimentoLicitacao } from "@/interfaces/enums/TipoProcedimentoLicitacao"
import { Licitacao } from "@/interfaces/licitacao/Licitacao"

import { formatarMoeda } from "@/utils/currency"
import { formatarData } from "@/utils/date"

import Link from "next/link"
import { MdVisibility } from "react-icons/md"

interface Props {
  licitacao: Licitacao
}

export default function LicitacaoCard({ licitacao }: Props) {

  const statusStyle = {
    EM_ABERTO: "bg-blue-100 text-blue-700",
    EM_ANDAMENTO: "bg-yellow-100 text-yellow-700",
    FINALIZADO: "bg-green-100 text-green-700",
    SUSPENSO: "bg-red-100 text-red-700",
    DESERTA: "bg-gray-100 text-gray-600",
    FRACASSADA: "bg-gray-100 text-gray-600",
    ANULADA: "bg-red-100 text-red-700",
    SINC_ABERTO: "bg-blue-100 text-blue-700",
    SINC_ANDAMENTO: "bg-yellow-100 text-yellow-700",
    INCLUIDO_SISTEMA: "bg-gray-100 text-gray-600"
  }[licitacao.status]

  return (
    <div className="bg-white border border-border/30 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex justify-between items-start gap-3">

        <div>
          <h2 className="text-base font-bold text-primary leading-tight">
            {TipoProcedimentoDescricao[licitacao.tipoProcedimento as TipoProcedimentoLicitacao]}{" "}
            {licitacao.numeroInstrumento}/{licitacao.ano}
          </h2>

          <p className="text-xs text-text-secondary/60 mt-1">
            Processo: {licitacao.numeroProcesso || "-"}
          </p>
        </div>

        <span className={`text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide ${statusStyle}`}>
          {StatusLicitacaoDescricao[licitacao.status as StatusLicitacao]}
        </span>

      </div>

      {/* OBJETO */}
      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
        {licitacao.objeto}
      </p>

      {/* GRID INFO */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Abertura</p>
          <p className="font-semibold text-text-secondary">
            {formatarData(licitacao.dataAbertura)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Sessão</p>
          <p className="font-semibold text-text-secondary">
            {formatarData(licitacao.dataSessao)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Valor</p>
          <p className="font-semibold text-accent">
            {licitacao.valorEstimado
              ? formatarMoeda(licitacao.valorEstimado)
              : "Não informado"}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Modalidade</p>
          <p className="font-semibold text-text-secondary truncate">
            {TipoProcedimentoDescricao[licitacao.tipoProcedimento as TipoProcedimentoLicitacao]}
          </p>
        </div>

      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between pt-3 border-t border-border/20">

        <p className="text-xs text-text-secondary/60">
          Publicação: {formatarData(licitacao.dataPublicacao)}
        </p>

        <Link
          href={`/licitacoes/${licitacao.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
        >
          <MdVisibility size={18} />
          Ver
        </Link>

      </div>

    </div>
  )
}