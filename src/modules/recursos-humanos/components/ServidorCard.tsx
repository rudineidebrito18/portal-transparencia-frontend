import Link from 'next/link'
import { MdBadge, MdSchedule, MdVisibility } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { Servidor } from '../types'

interface Props {
  servidor: Servidor
}

export default function ServidorCard({ servidor }: Props) {
  // Um servidor pode ter mais de um cargo, todos com o mesmo peso — mostra o primeiro aqui; os
  // demais aparecem completos na página de detalhes.
  const referencia = servidor.cargos[0]
  const outrosCargos = servidor.cargos.length - 1

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
          <p className="text-xs text-text-muted mt-0.5">
            Cargo: {referencia?.cargo ?? 'Não informado'}
            {outrosCargos > 0 && ` (+${outrosCargos} outro${outrosCargos > 1 ? 's' : ''})`}
          </p>
        </div>
      </div>

      {/* GRID INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
        <div>
          <p className="text-xs uppercase text-text-muted">Admissão</p>
          <p className="font-semibold text-text-secondary">
            {referencia ? formatarData(referencia.dataAdmissao) : 'Não informada'}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted flex items-center gap-1">
            <MdSchedule size={12} /> Carga Horária
          </p>
          <p className="font-semibold text-text-secondary">
            {referencia ? `${referencia.cargaHoraria}h/semana` : 'Não informada'}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Unidade</p>
          <p className="font-semibold text-text-secondary truncate">
            {referencia?.unidade?.nome || 'Não informada'}
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
