import Image from 'next/image'
import Link from 'next/link'
import { MdApartment, MdBadge, MdEmail, MdLocationOn, MdPhone, MdSchedule, MdVisibility } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { Unidade } from '../types'
import SelinhoVerificado from './SelinhoVerificado'

interface Props {
  unidade: Unidade
}

function LinhaContato({ icon: Icon, valor }: { icon: typeof MdEmail; valor?: string }) {
  if (!valor) return null

  return (
    <p className="text-xs text-text-secondary/70 flex items-center gap-2">
      <Icon size={14} className="text-text-secondary/40 shrink-0" />
      <span className="truncate">{valor}</span>
    </p>
  )
}

export default function SecretariaCard({ unidade }: Props) {
  return (
    <Card className="p-5 flex flex-col gap-3 h-full">
      <div className="flex items-start gap-3">
        {unidade.gestorFotoUrl ? (
          <Image
            src={unidade.gestorFotoUrl}
            alt={unidade.gestorNome}
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <MdApartment size={20} />
          </div>
        )}

        <div className="min-w-0">
          <h2 className="text-base font-bold text-primary leading-tight">{unidade.nome}</h2>
          {unidade.gestorNome && (
            <p className="text-xs text-text-secondary/60 mt-1 flex items-center gap-1">
              <MdBadge size={14} />
              {unidade.gestorNome}{unidade.gestorCargo && ` — ${unidade.gestorCargo}`}
            </p>
          )}
          {unidade.gestorVerificado && <SelinhoVerificado className="mt-1" />}
        </div>
      </div>

      <div className="space-y-1.5">
        <LinhaContato icon={MdEmail} valor={unidade.email} />
        <LinhaContato icon={MdPhone} valor={unidade.telefone} />
        <LinhaContato icon={MdSchedule} valor={unidade.horarioAtendimento} />
        <LinhaContato icon={MdLocationOn} valor={unidade.endereco} />
      </div>

      <div className="flex items-center justify-end mt-auto pt-3 border-t border-border/20">
        <Link
          href={`/secretarias/${unidade.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
        >
          <MdVisibility size={18} />
          Mais informações
        </Link>
      </div>
    </Card>
  )
}
