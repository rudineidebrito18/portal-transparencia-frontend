import { fakerPT_BR as faker } from '@faker-js/faker'

import { Page } from '@/modules/shared/types/Page'
import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { buscarServidorMockPorId } from './servidor.mock'
import { FiltroFolhaPagamento, FolhaPagamento, FolhaPagamentoServidor } from '../types'

interface FolhaRecord extends FolhaPagamento {
  servidorId: number
}

const CARGO_SALARIO_BASE: Record<string, number> = {
  Professor: 3200,
  Enfermeiro: 4100,
  'Agente Administrativo': 2200,
  Motorista: 2400,
  'Auxiliar de Serviços Gerais': 1800,
  'Assistente Social': 3500,
  'Fiscal de Obras': 3000,
  Contador: 4800,
  'Procurador Municipal': 9500,
  Médico: 12000
}

const MESES_HISTORICO = 18

function gerarHistoricoServidor(servidorId: number): FolhaRecord[] {
  const servidor = buscarServidorMockPorId(servidorId)
  if (!servidor) return []

  faker.seed(servidorId + 1000)

  // Folha usa o cargo PRINCIPAL do servidor (primeiro da lista) — mesmo comportamento do backend.
  const principal = servidor.cargos[0]
  const salarioBase = principal ? CARGO_SALARIO_BASE[principal.cargo] ?? 2500 : 2500
  const hoje = new Date()

  return Array.from({ length: MESES_HISTORICO }, (_, i) => {
    const referencia = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const salarioBruto = Math.round((salarioBase + faker.number.float({ min: -150, max: 400 })) * 100) / 100
    const desconto = Math.round(salarioBruto * faker.number.float({ min: 0.08, max: 0.18 }) * 100) / 100

    return {
      id: servidorId * 1000 + i,
      servidorId,
      mes: referencia.getMonth() + 1,
      ano: referencia.getFullYear(),
      salarioBruto,
      desconto,
      salarioLiquido: Math.round((salarioBruto - desconto) * 100) / 100
    }
  })
}

const TOTAL_SERVIDORES_MOCK = 85
const folhas: FolhaRecord[] = Array.from(
  { length: TOTAL_SERVIDORES_MOCK },
  (_, i) => gerarHistoricoServidor(i + 1)
).flat()

export const folhaMock = {
  async listarPorServidor(servidorId: number): Promise<FolhaPagamento[]> {
    return folhas
      .filter(f => f.servidorId === servidorId)
      .sort((a, b) => b.ano - a.ano || b.mes - a.mes)
      .map(({ id, mes, ano, salarioBruto, desconto, salarioLiquido }) => ({
        id,
        mes,
        ano,
        salarioBruto,
        desconto,
        salarioLiquido
      }))
  },

  async listarPorMes(params: FiltroFolhaPagamento & { page?: number; size?: number; sort?: string }): Promise<Page<FolhaPagamentoServidor>> {
    const { mes, ano, nomeServidor, cpf, cargo, unidadeId, page, size, sort } = params

    type FolhaComUnidadeId = FolhaPagamentoServidor & { unidadeId?: number }

    let dados: FolhaComUnidadeId[] = folhas
      .filter(f => f.mes === mes && f.ano === ano)
      .map(f => {
        const servidor = buscarServidorMockPorId(f.servidorId)
        const principal = servidor?.cargos[0]

        return {
          id: f.id,
          mes: f.mes,
          ano: f.ano,
          salarioBruto: f.salarioBruto,
          descontos: f.desconto,
          salarioLiquido: f.salarioLiquido,
          nomeServidor: servidor?.name ?? 'Desconhecido',
          cpfServidor: servidor?.cpf ?? '-',
          cargo: principal?.cargo,
          unidadeNome: principal?.unidade?.nome,
          unidadeId: principal?.unidade?.id,
          cargaHoraria: principal?.cargaHoraria,
          dataAdmissao: principal?.dataAdmissao
        }
      })

    if (nomeServidor) {
      dados = dados.filter(f => f.nomeServidor.toLowerCase().includes(nomeServidor.toLowerCase()))
    }
    if (cpf) {
      dados = dados.filter(f => f.cpfServidor.includes(cpf))
    }
    if (cargo) {
      dados = dados.filter(f => f.cargo === cargo)
    }
    if (unidadeId) {
      dados = dados.filter(f => f.unidadeId === Number(unidadeId))
    }

    // 'servidor.name' é a chave de sort real do backend (ordena a entidade, não o DTO) —
    // aqui no mock o campo equivalente já vem achatado como 'nomeServidor'.
    const sortMock = sort?.replace('servidor.name', 'nomeServidor')
    dados = ordenar(dados as unknown as Record<string, unknown>[], sortMock) as unknown as FolhaComUnidadeId[]

    return paginar(dados, page, size)
  }
}
