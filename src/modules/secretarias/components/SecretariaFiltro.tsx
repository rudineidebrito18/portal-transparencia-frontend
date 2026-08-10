'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import { FiltroSecretaria } from '../types'

interface Props {
  valoresIniciais?: FiltroSecretaria
  onFiltrar: (filtros: FiltroSecretaria) => void
}

export default function SecretariaFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [nome, setNome] = useState(valoresIniciais?.nome ?? '')
  const [vigencia, setVigencia] = useState(valoresIniciais?.vigencia ?? '')

  const filtrosAtivosCount = [nome, vigencia].filter(v => v !== '').length

  function handleFiltrar() {
    onFiltrar({
      nome: nome || undefined,
      vigencia: vigencia || undefined
    })
  }

  function limparFiltros() {
    setNome('')
    setVigencia('')
    onFiltrar({})
  }

  return (
    <FiltroCard subtituloPadrao="Refine por nome ou vigência" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="nome">
            Nome
          </label>
          <Input
            id="nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleFiltrar() }}
            placeholder="Nome da secretaria/órgão..."
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="vigencia">
            Vigência
          </label>
          <Input
            type="date"
            id="vigencia"
            value={vigencia}
            onChange={e => setVigencia(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-3">
          <Button onClick={limparFiltros} variant="ghost">
            <MdRestartAlt />
            Limpar
          </Button>

          <Button onClick={handleFiltrar} variant="primary" size="lg" className="shadow-sm active:scale-95">
            <MdSearch />
            Aplicar
          </Button>
        </div>

      </div>
    </FiltroCard>
  )
}
