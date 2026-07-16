import {
  MdApartment,
  MdBadge,
  MdEmail,
  MdLocationOn,
  MdPhone,
  MdSchedule
} from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import DocumentList from '@/components/ui/DocumentList'
import EmptyState from '@/components/ui/EmptyState'
import InfoBlock from '@/components/ui/InfoBlock'
import { Documento } from '@/modules/shared/types/Documento'
import { formatarData } from '@/utils/date'
import { SecretariaDetalhe as SecretariaDetalheType, TipoDocumentoUnidadeDescricao } from '../types'

interface Props {
  detalhe: SecretariaDetalheType
}

export default function SecretariaDetalhe({ detalhe }: Props) {
  const { unidade, decretos, documentos, exGestores, ordenadores, setores } = detalhe

  const decretosComoDocumento: Documento[] = decretos.map(d => ({
    id: d.id,
    assunto: d.descricao,
    tipoDocumento: 'Decreto',
    dataEnvio: d.data,
    caminhoPdf: d.arquivoUrl
  }))

  const documentosComoDocumento: Documento[] = documentos.map(d => ({
    id: d.id,
    assunto: TipoDocumentoUnidadeDescricao[d.tipo],
    tipoDocumento: TipoDocumentoUnidadeDescricao[d.tipo],
    dataEnvio: d.dataEnvio,
    caminhoPdf: d.arquivoUrl
  }))

  return (
    <div className="space-y-8">
      <Card className="p-6 flex flex-col md:flex-row gap-6" hoverable={false}>
        {unidade.gestorFotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={unidade.gestorFotoUrl}
            alt={unidade.gestorNome}
            className="w-28 h-28 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-28 h-28 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MdApartment size={40} />
          </div>
        )}

        <div className="flex-1">
          <h2 className="text-lg font-bold text-primary">{unidade.gestorNome || 'Gestor não informado'}</h2>
          <p className="text-sm text-text-secondary/70">
            {unidade.gestorCargo}
            {unidade.gestorVerificado && <Badge className="bg-success/10 text-success ml-2">Cadastro verificado</Badge>}
          </p>

          {(unidade.dataInicio || unidade.dataFim) && (
            <p className="text-xs text-text-secondary/50 mt-2">
              Órgão vigente de {formatarData(unidade.dataInicio ?? undefined)} a {unidade.dataFim ? formatarData(unidade.dataFim) : 'o momento'}
            </p>
          )}

          {unidade.atribuicoes && (
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line mt-3">
              {unidade.atribuicoes}
            </p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoBlock label="CNPJ" value={unidade.cnpj} icon={MdBadge} />
        <InfoBlock label="Telefone" value={unidade.telefone} icon={MdPhone} />
        <InfoBlock label="E-mail" value={unidade.email} icon={MdEmail} />
        <InfoBlock label="Horário de atendimento" value={unidade.horarioAtendimento} icon={MdSchedule} />
        <InfoBlock label="Endereço" value={unidade.endereco} icon={MdLocationOn} />
      </div>

      {setores.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-primary mb-3">Setores</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {setores.map(s => (
              <Card key={s.id} className="p-4">
                <p className="font-semibold text-sm text-text-secondary">{s.nome}</p>
                <p className="text-xs text-text-secondary/60 mt-1">{s.descricao}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-lg font-bold text-primary mb-3">Ordenadores de despesa</h3>
        <PessoaCargoList lista={ordenadores} emptyMessage="Nenhum ordenador de despesa cadastrado." />
      </section>

      <section>
        <h3 className="text-lg font-bold text-primary mb-3">Histórico de gestores</h3>
        <PessoaCargoList lista={exGestores} emptyMessage="Nenhum ex-gestor cadastrado." />
      </section>

      <section>
        <h3 className="text-lg font-bold text-primary mb-3">Decretos</h3>
        <DocumentList documentos={decretosComoDocumento} emptyMessage="Nenhum decreto cadastrado." />
      </section>

      <section>
        <h3 className="text-lg font-bold text-primary mb-3">Documentos institucionais</h3>
        <DocumentList documentos={documentosComoDocumento} emptyMessage="Nenhum documento disponível." />
      </section>
    </div>
  )
}

function PessoaCargoList({ lista, emptyMessage }: { lista: SecretariaDetalheType['exGestores']; emptyMessage: string }) {
  if (lista.length === 0) return <EmptyState message={emptyMessage} />

  return (
    <div className="space-y-3">
      {lista.map(p => (
        <Card key={p.id} className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-secondary">{p.nome}</p>
            <p className="text-xs text-text-secondary/60">{p.cargo}</p>
          </div>
          <p className="text-xs text-text-secondary/50 whitespace-nowrap">
            {formatarData(p.dataInicio)} — {formatarData(p.dataFim)}
          </p>
        </Card>
      ))}
    </div>
  )
}
