import Link from "next/link"
import { MdVisibility } from "react-icons/md"

import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import { formatarMoeda } from "@/utils/currency"
import { formatarData } from "@/utils/date"

import {
  StatusLicitacao,
  StatusLicitacaoDescricao,
  StatusLicitacaoStyle,
  TipoProcedimentoDescricao,
  TipoProcedimentoLicitacao
} from "../enums"
import { LicitacaoResumo } from "../types"

interface Props {
  licitacao: LicitacaoResumo
}

function normalizarStatus(valor: string): StatusLicitacao | undefined {
  const chave = valor.toUpperCase().replace(/\s+/g, "_") as StatusLicitacao
  return chave in StatusLicitacaoDescricao ? chave : undefined
}

export default function LicitacaoCard({ licitacao }: Props) {
  const statusKey = normalizarStatus(licitacao.statusDescricao)
  const statusLabel = statusKey ? StatusLicitacaoDescricao[statusKey] : licitacao.statusDescricao
  const statusStyle = statusKey ? StatusLicitacaoStyle[statusKey] : "bg-gray-100 text-gray-600"

  const tipoLabel =
    TipoProcedimentoDescricao[licitacao.tipo as TipoProcedimentoLicitacao] || licitacao.tipo

  return (
    <Card className="p-5 flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex justify-between items-start gap-3">
        <h2 className="text-base font-bold text-primary leading-tight">
          {tipoLabel} {licitacao.numeroInstrumento}/{licitacao.ano}
        </h2>

        <Badge className={statusStyle}>{statusLabel}</Badge>
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
          <p className="text-[11px] uppercase text-text-secondary/50">Valor</p>
          <p className="font-semibold text-accent">
            {licitacao.valorTotalDespesa
              ? formatarMoeda(licitacao.valorTotalDespesa)
              : "Não informado"}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-[11px] uppercase text-text-secondary/50">Unidade</p>
          <p className="font-semibold text-text-secondary truncate">
            {licitacao.unidade || "Não informada"}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-end pt-3 border-t border-border/20">
        <Link
          href={`/licitacoes/${licitacao.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
        >
          <MdVisibility size={18} />
          Ver
        </Link>
      </div>

    </Card>
  )
}
