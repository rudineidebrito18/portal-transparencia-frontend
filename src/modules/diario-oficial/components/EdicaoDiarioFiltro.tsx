'use client'

import { useState } from 'react'
import { MdClose, MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { TipoEdicaoDiario, TipoEdicaoDiarioDescricao } from '../enums'
import { FiltroEdicaoDiario } from '../types'
import { extrairTermos, montarTermo } from '../utils'

interface Props {
  valoresIniciais?: FiltroEdicaoDiario
  onFiltrar: (filtros: FiltroEdicaoDiario) => void
}

export default function EdicaoDiarioFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [termos, setTermos] = useState<string[]>(() => extrairTermos(valoresIniciais?.termo))
  const [termoInput, setTermoInput] = useState('')
  const [tipo, setTipo] = useState(valoresIniciais?.tipo ?? '')
  const [numeroEdicao, setNumeroEdicao] = useState(
    valoresIniciais?.numeroEdicao ? String(valoresIniciais.numeroEdicao) : ''
  )
  const [dataInicial, setDataInicial] = useState(valoresIniciais?.dataInicial ?? '')
  const [dataFinal, setDataFinal] = useState(valoresIniciais?.dataFinal ?? '')

  const filtrosAtivosCount =
    (termos.length > 0 ? 1 : 0) + [tipo, numeroEdicao, dataInicial, dataFinal].filter(v => v !== '').length

  function adicionarTermo() {
    const valor = termoInput.trim()
    if (!valor) return
    setTermos(prev => (prev.includes(valor) ? prev : [...prev, valor]))
    setTermoInput('')
  }

  function removerTermo(termo: string) {
    setTermos(prev => prev.filter(t => t !== termo))
  }

  function handleFiltrar() {
    // Texto ainda digitado mas não confirmado com Enter entra na busca também — evita perder
    // o que a pessoa escreveu se ela clicar direto em "Aplicar".
    const valorPendente = termoInput.trim()
    const termosFinais = valorPendente && !termos.includes(valorPendente) ? [...termos, valorPendente] : termos

    if (valorPendente) {
      setTermos(termosFinais)
      setTermoInput('')
    }

    onFiltrar({
      termo: montarTermo(termosFinais),
      tipo: tipo || undefined,
      numeroEdicao: numeroEdicao ? Number(numeroEdicao) : undefined,
      dataInicial: dataInicial || undefined,
      dataFinal: dataFinal || undefined
    })
  }

  // Enter com texto digitado adiciona um termo (sem submeter); Enter com o campo vazio aplica
  // a busca — permite montar a lista e disparar tudo sem tirar a mão do teclado.
  function handleTermoKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()

    if (termoInput.trim()) {
      adicionarTermo()
    } else {
      handleFiltrar()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFiltrar()
    }
  }

  function limparFiltros() {
    setTermos([])
    setTermoInput('')
    setTipo('')
    setNumeroEdicao('')
    setDataInicial('')
    setDataFinal('')
    onFiltrar({})
  }

  return (
    <FiltroCard subtituloPadrao="Busque por palavra-chave no conteúdo ou refine por tipo, número e datas" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="md:col-span-2">
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="termo">
            Busca por conteúdo
          </label>
          <Input
            id="termo"
            type="search"
            value={termoInput}
            onChange={(e) => setTermoInput(e.target.value)}
            onKeyDown={handleTermoKeyDown}
            placeholder="Digite uma palavra ou frase e pressione Enter pra adicionar (ex.: licitação, &quot;nome da lei&quot;)..."
          />

          {termos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {termos.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {t.includes(' ') ? `"${t}"` : t}
                  <button
                    type="button"
                    onClick={() => removerTermo(t)}
                    aria-label={`Remover termo ${t}`}
                    className="p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <MdClose size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-text-muted mt-1">
            Quando preenchida, a busca por conteúdo é combinada com os filtros de tipo, número e datas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="tipo">
            Tipo
          </label>
          <Select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Todos</option>
            {Object.values(TipoEdicaoDiario).map(t => (
              <option key={t} value={t}>{TipoEdicaoDiarioDescricao[t]}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="numeroEdicao">
            Número da Edição
          </label>
          <Input
            id="numeroEdicao"
            type="number"
            value={numeroEdicao}
            onChange={(e) => setNumeroEdicao(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 123"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataInicial">
            Publicação (início)
          </label>
          <Input
            id="dataInicial"
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataFinal">
            Publicação (fim)
          </label>
          <Input
            id="dataFinal"
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
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
