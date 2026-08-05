import { ComponentType } from 'react'
import Link from 'next/link'
import {
  MdAccountBalance,
  MdApartment,
  MdBadge,
  MdBalance,
  MdBarChart,
  MdCalculate,
  MdCampaign,
  MdFactCheck,
  MdGavel,
  MdGroups,
  MdMilitaryTech,
  MdPayments,
  MdPerson,
  MdStar
} from 'react-icons/md'

import { secretariasService } from '@/modules/secretarias/secretarias.service'
import { Unidade } from '@/modules/secretarias/types'

interface No {
  titulo: string
  icon: ComponentType<{ size?: number; className?: string }>
}

const APOIO_AO_GABINETE: No[] = [
  { titulo: 'Assessoria Jurídica', icon: MdBalance },
  { titulo: 'Assessoria Especial', icon: MdGroups },
  { titulo: 'Assessoria Extraordinária', icon: MdStar },
  { titulo: 'Assessoria Técnica de Planejamento', icon: MdBarChart },
  { titulo: 'Assessoria de Comunicação', icon: MdCampaign },
  { titulo: 'Assessoria Contábil', icon: MdCalculate },
  { titulo: 'Comissão Permanente de Licitação (CPL)', icon: MdFactCheck },
  { titulo: 'Pregoeiro', icon: MdGavel },
  { titulo: 'Tesouraria', icon: MdPayments },
  { titulo: 'Junta de Serviço Militar', icon: MdMilitaryTech },
  { titulo: 'Setor de Identificação', icon: MdBadge }
]

const NOME_GABINETE = 'Gabinete do Prefeito'

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Assessorias/CPL/Pregoeiro/etc. não são Unidade no backend (só descrevem a estrutura,
// sem cadastro próprio) — só Gabinete e Secretarias têm chance real de casar. Nome da
// caixa costuma ser mais longo que o real cadastrado (ex.: caixa "Secretaria Municipal
// de Educação, Cultura e Turismo" vs. unidade real só "Secretaria Municipal de
// Educação") — includes() nos dois sentidos cobre isso sem exigir nome idêntico.
function encontrarUnidade(nomeBusca: string, unidades: Unidade[]): Unidade | undefined {
  const alvo = normalizar(nomeBusca)
  return unidades.find(u => {
    const nome = normalizar(u.nome)
    return nome.includes(alvo) || alvo.includes(nome)
  })
}

function Conector() {
  return <div aria-hidden className="w-px h-6 bg-border/40 mx-auto" />
}

function NoTopo({
  titulo,
  icon: Icon,
  href,
  destaque = false
}: {
  titulo: string
  icon: ComponentType<{ size?: number; className?: string }>
  href?: string
  destaque?: boolean
}) {
  const conteudo = (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wide shadow-sm
        ${destaque ? 'bg-white text-primary border-2 border-primary' : 'bg-primary text-white'}
        ${href ? 'hover:opacity-90 transition-opacity' : ''}`}
    >
      <Icon size={18} className="shrink-0" />
      {titulo}
    </div>
  )

  return (
    <div className="flex justify-center">
      {href ? <Link href={href}>{conteudo}</Link> : conteudo}
    </div>
  )
}

function GrupoNos({ nos, titulo: tituloGrupo }: { nos: (No & { href?: string })[]; titulo?: string }) {
  return (
    <div className="border-t-2 border-border/30 pt-6">
      {tituloGrupo && (
        <p className="text-center text-[11px] font-bold uppercase tracking-wide text-text-secondary/50 mb-4">
          {tituloGrupo}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
        {nos.map(({ titulo: tituloNo, icon: Icon, href }) => {
          const conteudo = (
            <div
              className={`flex items-center gap-2 rounded-lg border border-border/30 bg-white px-4 py-2.5 text-xs font-semibold text-text-secondary shadow-sm max-w-[220px]
                ${href ? 'hover:border-primary/40 hover:text-primary transition-colors' : ''}`}
            >
              <Icon size={16} className="shrink-0 text-primary" />
              <span>{tituloNo}</span>
            </div>
          )

          return (
            <div key={tituloNo}>
              {href ? <Link href={href}>{conteudo}</Link> : conteudo}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Estrutura real da Prefeitura de Lago dos Rodrigues (Lei Municipal nº 88/2009, alterada
// pela Lei nº 164/2016) — este sistema substitui o portal atual da prefeitura, não é
// conteúdo de exemplo de outro município. Hierarquia simplificada em relação ao
// organograma de origem: lá, Assessorias e os 5 órgãos de apoio (CPL, Pregoeiro,
// Tesouraria, Junta Militar, Setor de Identificação) aparecem em duas fileiras
// separadas por largura de tela; aqui viram um grupo só (mesmo nível hierárquico, todos
// vinculados ao Gabinete do Prefeito), com quebra de linha responsiva via flex-wrap.
//
// Server Component: busca as Unidades reais (`secretariasService.listar`). Gabinete do
// Prefeito ocupa posição fixa/especial no diagrama (entre Vice-Prefeito e as
// assessorias), então precisa ser encontrado por nome. Secretarias Municipais, ao
// contrário, não têm lista fixa aqui — é literalmente a lista de Unidades cadastradas
// (menos o Gabinete, que já aparece em cima), então cresce sozinha conforme o admin
// cadastra novas secretarias, sem precisar tocar neste componente de novo.
export default async function OrganogramaDiagrama() {
  const unidades = await secretariasService.listar({ sort: 'nome,asc' }).catch(() => [])

  const gabinete = encontrarUnidade(NOME_GABINETE, unidades)
  const secretarias = unidades.filter(u => u.id !== gabinete?.id)

  return (
    <div className="space-y-0">
      <NoTopo titulo="Prefeito Municipal" icon={MdPerson} href="/prefeito" />
      <Conector />
      <NoTopo titulo="Vice-Prefeito" icon={MdPerson} href="/vice-prefeito" />
      <Conector />
      <NoTopo
        titulo="Gabinete do Prefeito"
        icon={MdAccountBalance}
        href={gabinete ? `/secretarias/${gabinete.id}` : undefined}
      />
      <Conector />

      <GrupoNos nos={APOIO_AO_GABINETE} titulo="Assessorias e Órgãos de Apoio" />

      <Conector />
      <NoTopo titulo="Secretarias Municipais" icon={MdGroups} href="/secretarias" destaque />
      <Conector />

      {secretarias.length > 0 ? (
        <GrupoNos
          nos={secretarias.map(u => ({ titulo: u.nome, icon: MdApartment, href: `/secretarias/${u.id}` }))}
        />
      ) : (
        <p className="border-t-2 border-border/30 pt-6 text-center text-xs text-text-secondary/50">
          Secretarias cadastradas no admin aparecem aqui automaticamente.
        </p>
      )}

      <p className="text-xs text-text-secondary/60 text-center mt-8 max-w-2xl mx-auto leading-relaxed">
        <strong>Base legal:</strong> Lei Municipal nº 88/2009, de 17 de agosto de 2009,
        alterada pela Lei nº 164/2016 — dispõe sobre a estrutura administrativa do
        Município de Lago dos Rodrigues – MA e dá outras providências.
      </p>
    </div>
  )
}
