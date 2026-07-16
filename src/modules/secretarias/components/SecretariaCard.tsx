import Link from 'next/link'
import { MdApartment, MdBadge } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { Unidade } from '../types'

interface Props {
  unidade: Unidade
}

export default function SecretariaCard({ unidade }: Props) {
  return (
    <Link href={`/secretarias/${unidade.id}`}>
      <Card className="p-5 flex flex-col gap-3 h-full">
        <div className="flex items-start gap-3">
          {unidade.gestorFotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={unidade.gestorFotoUrl}
              alt={unidade.gestorNome}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <MdApartment size={20} />
            </div>
          )}

          <div>
            <h2 className="text-base font-bold text-primary leading-tight">{unidade.nome}</h2>
            {unidade.gestorNome && (
              <p className="text-xs text-text-secondary/60 mt-1 flex items-center gap-1">
                <MdBadge size={14} />
                {unidade.gestorNome}{unidade.gestorCargo && ` — ${unidade.gestorCargo}`}
              </p>
            )}
          </div>
        </div>

        {unidade.atribuicoes && (
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
            {unidade.atribuicoes}
          </p>
        )}

        <div className="text-xs text-text-secondary/60 mt-auto pt-2">
          {unidade.telefone || unidade.email || 'Sem contato cadastrado'}
        </div>
      </Card>
    </Link>
  )
}
