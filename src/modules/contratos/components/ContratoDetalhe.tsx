import {
  MdAccountBalance,
  MdAttachMoney,
  MdBusiness,
  MdCalendarToday,
  MdDescription,
  MdGavel,
  MdPerson
} from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import InfoBlock from '@/components/ui/InfoBlock'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { contratoStatusLabel, contratoStatusStyle } from '../status'
import { ContratoLicitacao } from '../types'

interface Props {
  contrato: ContratoLicitacao
}

export default function ContratoDetalhe({ contrato }: Props) {
  return (
    <div className="bg-light border border-border/30 rounded-2xl shadow-md overflow-hidden mb-10">

      {/* HEADER */}
      <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/20">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase bg-primary text-white px-2 py-1 rounded">
              Licitação {contrato.numeroLicitacao}
            </span>

            <h1 className="text-2xl font-extrabold text-primary tracking-tight mt-2">
              Contrato Nº {contrato.numeroContrato} / {contrato.exercicio}
            </h1>
          </div>

          <Badge size="md" className={`self-start ${contratoStatusStyle(contrato.status)}`}>
            {contratoStatusLabel(contrato.status)}
          </Badge>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
          <InfoBlock label="Fornecedor" value={contrato.fornecedor} icon={MdBusiness} />
          <InfoBlock label="Gestor do Contrato" value={contrato.gestorContrato} icon={MdPerson} />
          <InfoBlock label="Valor do Contrato" value={formatarMoeda(contrato.valorContrato)} icon={MdAttachMoney} />
          <InfoBlock label="Meio de Publicação" value={contrato.meioPublicacao} icon={MdGavel} />

          <InfoBlock label="Assinatura" value={formatarData(contrato.dataAssinatura)} icon={MdCalendarToday} />
          <InfoBlock label="Publicação" value={formatarData(contrato.dataPublicacao)} />
          <InfoBlock label="Início da Vigência" value={formatarData(contrato.dataInicio)} />
          <InfoBlock label="Término da Vigência" value={formatarData(contrato.dataTermino)} />
        </div>

        {/* UNIDADE */}
        <div className="grid grid-cols-1 gap-5 mb-10">
          <div className="bg-white p-5 rounded-xl border border-border/30 shadow-sm">
            <p className="text-xs uppercase text-text-secondary/50 mb-1 flex items-center gap-1">
              <MdAccountBalance /> Unidade
            </p>
            <p className="font-bold text-primary uppercase">
              {contrato.unidade || 'Não informada'}
            </p>
          </div>
        </div>

        {/* OBJETO */}
        <div>
          <h3 className="font-bold text-primary uppercase text-sm tracking-wider mb-3 flex items-center gap-2">
            <MdDescription /> Objeto do Contrato
          </h3>

          <div className="bg-white border border-border/30 p-6 rounded-xl shadow-sm">
            <p className="text-text-secondary leading-relaxed text-[15px] text-justify">
              {contrato.objeto}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
