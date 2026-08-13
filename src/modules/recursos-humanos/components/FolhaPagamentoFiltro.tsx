'use client'

import { useEffect, useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { secretariasService } from '@/modules/secretarias/secretarias.service'
import { Unidade } from '@/modules/secretarias/types'
import { nomeMes } from '@/utils/date'
import { FiltroFolhaPagamento } from '../types'

interface Props {
  valoresIniciais?: FiltroFolhaPagamento
  onFiltrar: (filtros: FiltroFolhaPagamento) => void
}

const anoAtual = new Date().getFullYear()
const anos = Array.from({ length: 6 }, (_, i) => anoAtual - i)
const mesAtual = new Date().getMonth() + 1

export default function FolhaPagamentoFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [mes, setMes] = useState(valoresIniciais?.mes ?? mesAtual)
  const [ano, setAno] = useState(valoresIniciais?.ano ?? anoAtual)
  const [nomeServidor, setNomeServidor] = useState(valoresIniciais?.nomeServidor ?? '')
  const [cpf, setCpf] = useState(valoresIniciais?.cpf ?? '')
  const [cargo, setCargo] = useState(valoresIniciais?.cargo ?? '')
  const [unidadeId, setUnidadeId] = useState(valoresIniciais?.unidadeId ? String(valoresIniciais.unidadeId) : '')

  const [unidades, setUnidades] = useState<Unidade[]>([])
  useEffect(() => {
    secretariasService.listar({ sort: 'nome,asc' }).then(setUnidades).catch(() => {})
  }, [])

  const filtrosAtivosCount = [nomeServidor, cpf, cargo, unidadeId].filter(v => v !== '').length

  function handleFiltrar() {
    onFiltrar({
      mes,
      ano,
      nomeServidor: nomeServidor || undefined,
      cpf: cpf || undefined,
      cargo: cargo || undefined,
      unidadeId: unidadeId ? Number(unidadeId) : undefined
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFiltrar()
    }
  }

  function limparFiltros() {
    setMes(mesAtual)
    setAno(anoAtual)
    setNomeServidor('')
    setCpf('')
    setCargo('')
    setUnidadeId('')
    onFiltrar({ mes: mesAtual, ano: anoAtual })
  }

  return (
    <FiltroCard subtituloPadrao={`Exibindo ${nomeMes(mesAtual)} de ${anoAtual}`} filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="mes">
            Mês
          </label>
          <Select id="mes" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{nomeMes(m)}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="ano">
            Ano
          </label>
          <Select id="ano" value={ano} onChange={(e) => setAno(Number(e.target.value))}>
            {anos.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="nomeServidor">
            Nome do Servidor
          </label>
          <Input
            id="nomeServidor"
            value={nomeServidor}
            onChange={(e) => setNomeServidor(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Maria Oliveira"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="cpf">
            CPF
          </label>
          <Input
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 111.222.333-44"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="cargo">
            Cargo
          </label>
          <Input
            id="cargo"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Professor"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="unidadeId">
            Unidade
          </label>
          <Select id="unidadeId" value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>
            <option value="">Todas</option>
            {unidades.map(u => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </Select>
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/20">
        <Button onClick={limparFiltros} variant="ghost">
          <MdRestartAlt />
          Voltar pro mês atual
        </Button>

        <Button onClick={handleFiltrar} variant="primary" size="lg" className="shadow-sm active:scale-95">
          <MdSearch />
          Aplicar
        </Button>
      </div>

    </FiltroCard>
  )
}
