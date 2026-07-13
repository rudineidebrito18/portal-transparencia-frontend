'use client'

import { MdEmail, MdLocationOn, MdPhone, MdSchedule } from 'react-icons/md'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useInformacoesEsic } from '../hooks/useInformacoesEsic'

export default function InformacoesEsicView() {
  const { data: info, loading, erro } = useInformacoesEsic()

  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  if (erro) return <ErrorState message={erro} />

  if (!info) return <EmptyState message="Nenhuma informação de atendimento disponível." />

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <p className="text-sm text-text-secondary leading-relaxed">
          O Serviço de Informação ao Cidadão (e-SIC) é o canal para solicitar informações
          públicas ao município, conforme a Lei de Acesso à Informação.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <MdLocationOn size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold text-text-secondary/50">Endereço de atendimento</p>
            <p className="text-sm font-semibold text-text-secondary mt-1">{info.enderecoAtendimento}</p>
            <p className="text-xs text-text-secondary/60 mt-2">Responsável: {info.nomeResponsavel}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <MdSchedule size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold text-text-secondary/50">Horário de atendimento</p>
            <p className="text-sm font-semibold text-text-secondary mt-1">
              {info.horarioInicioManha} às {info.horarioFimManha} e {info.horarioInicioTarde} às {info.horarioFimTarde}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <MdPhone size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold text-text-secondary/50">Telefone</p>
            <p className="text-sm font-semibold text-text-secondary mt-1">{info.telefone}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <MdEmail size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold text-text-secondary/50">E-mail</p>
            <p className="text-sm font-semibold text-text-secondary mt-1">{info.email}</p>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <p className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-3">Prazos de resposta</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-secondary/60">Resposta padrão</p>
            <p className="font-bold text-primary">{info.prazoRespostaDisponivel} dias</p>
          </div>
          <div>
            <p className="text-text-secondary/60">Prorrogação (busca e tratamento)</p>
            <p className="font-bold text-primary">{info.prazoRespostaBusca} dias</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
