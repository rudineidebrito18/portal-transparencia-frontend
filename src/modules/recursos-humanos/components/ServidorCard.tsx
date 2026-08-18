import Link from 'next/link'
import { MdBadge, MdSchedule, MdStar, MdVisibility } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { Servidor } from '../types'

interface Props {
  servidor: Servidor
}

// Cargos vêm ordenados com o principal primeiro — o card mostra os dados do cargo
// principal (referência da folha de pagamento) e um resumo dos cargos secundários.
export default function ServidorCard({ servidor }: Props) {
  const principal = servidor.cargos[0]
  const cargosExtras = servidor.cargos.length - 1

  return (
    <Card className="p-4 flex flex-col gap-2.5">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <MdBadge size={20} />
        </div>

        <div>
          <h2 className="text-base font-bold text-primary leading-tight">
            Nome: {servidor.name}
          </h2>
          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
            Cargo: {principal?.cargo ?? '—'}
            {principal?.principal && <MdStar size={12} className="text-accent" aria-label="Cargo principal" />}
            {cargosExtras > 0 && <span>+{cargosExtras} outro(s)</span>}
          </p>
        </div>
      </div>

      {/* GRID INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
        <div>
          <p className="text-xs uppercase text-text-muted">Admissão</p>
          <p className="font-semibold text-text-secondary">
            {formatarData(principal?.dataAdmissao)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted flex items-center gap-1">
            <MdSchedule size={12} /> Carga Horária
          </p>
          <p className="font-semibold text-text-secondary">
            {principal?.cargaHoraria ? `${principal.cargaHoraria}h/semana` : 'Não informada'}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Unidade</p>
          <p className="font-semibold text-text-secondary truncate">
            {principal?.unidade?.nome || 'Não informada'}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-end pt-2 border-t border-border/20">
        <Link
          href={`/servidores/${servidor.id}`}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
        >
          <MdVisibility size={18} />
          Ver
        </Link>
      </div>

    </Card>
  )
}
