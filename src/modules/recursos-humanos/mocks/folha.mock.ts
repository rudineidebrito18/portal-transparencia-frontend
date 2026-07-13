import { fakerPT_BR as faker } from '@faker-js/faker'

import { buscarServidorMockPorId } from './servidor.mock'
import { FolhaPagamento, FolhaPagamentoServidor } from '../types'

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

  const salarioBase = CARGO_SALARIO_BASE[servidor.cargo] ?? 2500
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

  async listarPorMes(mes: number, ano: number): Promise<FolhaPagamentoServidor[]> {
    return folhas
      .filter(f => f.mes === mes && f.ano === ano)
      .map(f => {
        const servidor = buscarServidorMockPorId(f.servidorId)

        return {
          id: f.id,
          mes: f.mes,
          ano: f.ano,
          salarioBruto: f.salarioBruto,
          descontos: f.desconto,
          salarioLiquido: f.salarioLiquido,
          nomeServidor: servidor?.name ?? 'Desconhecido',
          cpfServidor: servidor?.cpf ?? '-'
        }
      })
      .sort((a, b) => a.nomeServidor.localeCompare(b.nomeServidor))
  }
}
