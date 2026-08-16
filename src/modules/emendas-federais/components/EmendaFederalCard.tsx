import { MdOpenInNew, MdSync } from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { formatarMoeda } from '@/utils/currency'
import { formatarDataHora } from '@/utils/date'
import { FonteEmenda, FonteEmendaDescricao, TipoEmenda, TipoEmendaDescricao } from '../enums'
import { EmendaFederal } from '../types'

interface Props {
  emenda: EmendaFederal
}

export default function EmendaFederalCard({ emenda }: Props) {
  const tipoLabel = emenda.tipoEmenda ? (TipoEmendaDescricao[emenda.tipoEmenda as TipoEmenda] ?? emenda.tipoEmenda) : '—'
  const fonteLabel = FonteEmendaDescricao[emenda.fonteOrigem as FonteEmenda] ?? emenda.fonteOrigem

  return (
    <Card className="p-5 flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <h2 className="text-base font-bold text-primary leading-tight">
          Emenda Nº {emenda.codigoEmenda}
        </h2>

        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary">{tipoLabel}</Badge>
          <Badge className="bg-accent/10 text-accent flex items-center gap-1">
            <MdSync size={14} />
            {fonteLabel}
          </Badge>
        </div>
      </div>

      {/* OBJETO */}
      {emenda.objeto && (
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
          {emenda.objeto}
        </p>
      )}

      {/* GRID INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <p className="text-xs uppercase text-text-muted">Autor</p>
          <p className="font-semibold text-text-secondary truncate">
            {emenda.autorNome ?? '—'}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Situação</p>
          <p className="font-semibold text-text-secondary">
            {emenda.situacao ?? '—'}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Valor Indicado</p>
          <p className="font-semibold text-accent">
            {emenda.valorIndicado !== null ? formatarMoeda(emenda.valorIndicado) : '—'}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Valor Pago</p>
          <p className="font-semibold text-accent">
            {emenda.valorPago !== null ? formatarMoeda(emenda.valorPago) : '—'}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between pt-3 border-t border-border/20">
        <span className="text-xs text-text-muted">
          {emenda.dataUltimaSincronizacao
            ? `Última sincronização: ${formatarDataHora(emenda.dataUltimaSincronizacao)}`
            : 'Cadastrado manualmente'}
        </span>

        {emenda.linkDetalhes && (
          <a
            href={emenda.linkDetalhes}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
          >
            <MdOpenInNew size={18} />
            Ver detalhes
          </a>
        )}
      </div>

    </Card>
  )
}
