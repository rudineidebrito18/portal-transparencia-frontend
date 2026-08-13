'use client'

import { useEffect, useRef, useState } from 'react'
import { MdClose, MdSearch } from 'react-icons/md'

import { servidorService } from '../servidor.service'
import { Servidor } from '../types'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg pl-9 pr-9 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'

interface Props {
  servidorSelecionado: Servidor | null
  onSelecionar: (servidor: Servidor | null) => void
}

// Query com pelo menos um dígito é tratada como busca por CPF (compara os 6 dígitos
// centrais, mesma regra de ServidorSpecification.cpf() — nunca por igualdade exata);
// senão busca por nome (parcial). Os dois filtros não podem ir juntos no mesmo request
// porque o backend combina filtros com AND, não OR.
function pareceCpf(query: string) {
  return /\d/.test(query)
}

export default function BuscarServidorInput({ servidorSelecionado, onSelecionar }: Props) {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<Servidor[]>([])
  const [buscando, setBuscando] = useState(false)
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([])
      return
    }

    setBuscando(true)
    const timer = setTimeout(() => {
      const filtro = pareceCpf(query) ? { cpf: query } : { name: query }
      servidorService
        .listar({ ...filtro, size: 20, sort: 'name,asc' })
        .then(p => setResultados(p.content))
        .catch(() => setResultados([]))
        .finally(() => setBuscando(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  function selecionar(servidor: Servidor) {
    onSelecionar(servidor)
    setQuery('')
    setResultados([])
    setAberto(false)
  }

  function limpar() {
    onSelecionar(null)
    setQuery('')
    setResultados([])
  }

  if (servidorSelecionado) {
    return (
      <div className="flex items-center gap-2 bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 md:w-96">
        <span className="text-sm text-admin-text flex-1 truncate">
          {servidorSelecionado.name} — {servidorSelecionado.cpf}
        </span>
        <button
          onClick={limpar}
          aria-label="Trocar servidor"
          className="p-1 rounded-md text-admin-text-faint hover:bg-admin-surface-3 hover:text-admin-text transition-colors shrink-0"
        >
          <MdClose size={16} />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative md:w-96">
      <MdSearch size={18} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-admin-text-faint" />
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setAberto(true) }}
        onFocus={() => setAberto(true)}
        placeholder="Buscar por nome ou CPF..."
        className={classeInput}
        aria-label="Buscar servidor por nome ou CPF"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          aria-label="Limpar busca"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-text-faint hover:text-admin-text transition-colors"
        >
          <MdClose size={16} />
        </button>
      )}

      {aberto && query.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-admin-border bg-admin-surface-2 shadow-admin-lg max-h-64 overflow-y-auto">
          {buscando && (
            <p className="px-3 py-2.5 text-sm text-admin-text-faint">Buscando...</p>
          )}
          {!buscando && resultados.length === 0 && (
            <p className="px-3 py-2.5 text-sm text-admin-text-faint">Nenhum servidor encontrado.</p>
          )}
          {!buscando && resultados.map(s => (
            <button
              key={s.id}
              onClick={() => selecionar(s)}
              className="block w-full text-left px-3 py-2.5 text-sm text-admin-text hover:bg-admin-surface-3 transition-colors border-b border-admin-border last:border-0"
            >
              <span className="font-semibold">{s.name}</span>
              <span className="text-admin-text-faint"> — {s.cpf}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
