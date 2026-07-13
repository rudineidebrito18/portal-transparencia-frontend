import Link from 'next/link'
import { MdBadge, MdSchedule, MdVisibility } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { Servidor } from '../types'

interface Props {
  servidor: Servidor
}

export default function ServidorCard({ servidor }: Props) {
  return (
    <Card className="p-5 flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <MdBadge size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-primary leading-tight">
              {servidor.name}
            </h2>
            <p className="text-xs text-text-secondary/60 mt-0.5">{servidor.cargo}</p>
          </div>
        </div>
      </div>

      {/* GRID INFO */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Admissão</p>
          <p className="font-semibold text-text-secondary">
            {formatarData(servidor.dataAdmissao)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50 flex items-center gap-1">
            <MdSchedule size={12} /> Carga Horária
          </p>
          <p className="font-semibold text-text-secondary">
            {servidor.cargaHoraria}h/semana
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-[11px] uppercase text-text-secondary/50">Unidade</p>
          <p className="font-semibold text-text-secondary truncate">
            {servidor.unidade?.nome || 'Não informada'}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-end pt-3 border-t border-border/20">
        <Link
          href={`/servidores/${servidor.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
        >
          <MdVisibility size={18} />
          Ver
        </Link>
      </div>

    </Card>
  )
}
