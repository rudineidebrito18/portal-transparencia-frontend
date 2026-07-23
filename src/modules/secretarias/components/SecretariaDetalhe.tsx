'use client'

import Image from 'next/image'
import {
  MdApartment,
  MdBadge,
  MdEmail,
  MdFileDownload,
  MdLocationOn,
  MdPhone,
  MdSchedule
} from 'react-icons/md'

import Card from '@/components/ui/Card'
import DocumentList from '@/components/ui/DocumentList'
import EmptyState from '@/components/ui/EmptyState'
import InfoBlock from '@/components/ui/InfoBlock'
import { Documento } from '@/modules/shared/types/Documento'
import { useUrlState } from '@/hooks/useUrlState'
import { formatarData } from '@/utils/date'
import { SecretariaDetalhe as SecretariaDetalheType, TipoDocumentoUnidade, TipoDocumentoUnidadeDescricao } from '../types'
import SelinhoVerificado from './SelinhoVerificado'

interface Props {
  detalhe: SecretariaDetalheType
}

type Aba = 'info' | 'ex-gestores' | 'ordenadores' | 'setores' | 'decretos'

const ABAS: { aba: Aba; label: string }[] = [
  { aba: 'info', label: 'Informações do Órgão' },
  { aba: 'ex-gestores', label: 'Ex-Gestores' },
  { aba: 'ordenadores', label: 'Ordenadores' },
  { aba: 'setores', label: 'Setores' },
  { aba: 'decretos', label: 'Decretos' }
]

const TIPOS_DOCUMENTO: TipoDocumentoUnidade[] = [
  TipoDocumentoUnidade.TERMO,
  TipoDocumentoUnidade.EDTC,
  TipoDocumentoUnidade.DECLARACAO_ESIC
]

export default function SecretariaDetalhe({ detalhe }: Props) {
  const { unidade, decretos, documentos, exGestores, ordenadores, setores } = detalhe
  const [aba, setAba] = useUrlState<Aba>('secao', 'info')

  const decretosComoDocumento: Documento[] = decretos.map(d => ({
    id: d.id,
    assunto: d.descricao,
    tipoDocumento: 'Decreto',
    dataEnvio: d.data,
    caminhoPdf: d.arquivoUrl
  }))

  return (
    <div className="space-y-6">
      <Card className="p-6 flex flex-col md:flex-row gap-6" hoverable={false}>
        {unidade.gestorFotoUrl ? (
          <Image
            src={unidade.gestorFotoUrl}
            alt={unidade.gestorNome}
            width={96}
            height={96}
            className="w-24 h-24 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MdApartment size={40} />
          </div>
        )}

        <div className="flex-1">
          <h2 className="text-lg font-bold text-primary">{unidade.gestorNome || 'Gestor não informado'}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary/70">
            <span>{unidade.gestorCargo}</span>
            {unidade.gestorVerificado && <SelinhoVerificado />}
          </div>

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

      <div>
        <h3 className="text-sm font-bold text-primary mb-3">Documentos institucionais</h3>
        <div className="flex flex-wrap gap-2">
          {TIPOS_DOCUMENTO.map(tipo => {
            const doc = documentos.find(d => d.tipo === tipo)
            const label = TipoDocumentoUnidadeDescricao[tipo]

            if (!doc) {
              return (
                <span
                  key={tipo}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-light text-text-secondary/40 text-sm font-semibold whitespace-nowrap cursor-not-allowed"
                >
                  <MdFileDownload size={16} />
                  {label} — não disponível
                </span>
              )
            }

            return (
              <a
                key={tipo}
                href={doc.arquivoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all whitespace-nowrap"
              >
                <MdFileDownload size={16} />
                {label}
              </a>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          {ABAS.map(item => (
            <button
              key={item.aba}
              onClick={() => setAba(item.aba)}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all
                ${aba === item.aba
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-neutral-light text-text-secondary hover:bg-primary/10'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {aba === 'info' && (
          unidade.atribuicoes ? (
            <Card className="p-5" hoverable={false}>
              <h3 className="text-sm font-bold text-primary mb-2">Atribuições da secretaria</h3>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {unidade.atribuicoes}
              </p>
            </Card>
          ) : (
            <EmptyState message="Nenhuma atribuição cadastrada." />
          )
        )}

        {aba === 'ex-gestores' && (
          <PessoaCargoList lista={exGestores} emptyMessage="Nenhum ex-gestor cadastrado." />
        )}

        {aba === 'ordenadores' && (
          <PessoaCargoList lista={ordenadores} emptyMessage="Nenhum ordenador de despesa cadastrado." />
        )}

        {aba === 'setores' && (
          setores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {setores.map(s => (
                <Card key={s.id} className="p-4">
                  <p className="font-semibold text-sm text-text-secondary">{s.nome}</p>
                  <p className="text-xs text-text-secondary/60 mt-1">{s.descricao}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState message="Nenhum setor cadastrado." />
          )
        )}

        {aba === 'decretos' && (
          <DocumentList documentos={decretosComoDocumento} emptyMessage="Nenhum decreto cadastrado." />
        )}
      </div>
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
