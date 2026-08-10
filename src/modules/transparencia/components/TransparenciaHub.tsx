'use client'

import { useEffect, useState } from 'react'
import { MdSearch } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import { useUrlState } from '@/hooks/useUrlState'
import { secoesAcessoInformacao } from '../data/secoes'
import SecaoAcesso from './SecaoAcesso'

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// Importa os dados direto aqui (em vez de receber por prop do Server Component da
// página) porque `secoesAcessoInformacao` carrega referências de função (os ícones) —
// RSC não serializa função como prop de Server pra Client Component.
export default function TransparenciaHub() {
  const [busca, setBusca] = useUrlState<string>('busca', '')

  // O input digita numa cópia local — `setBusca` do useUrlState faz router.replace a
  // cada chamada, e chamar isso por tecla digitada deixava a busca visivelmente
  // travada. A URL (pra ficar compartilhável) só é atualizada depois de uma pausa.
  const [buscaInput, setBuscaInput] = useState(busca)

  useEffect(() => {
    const timer = setTimeout(() => setBusca(buscaInput), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaInput])

  const termo = normalizar(buscaInput.trim())

  const secoesFiltradas = termo
    ? secoesAcessoInformacao
        .map(secao => ({
          ...secao,
          itens: secao.itens.filter(item => normalizar(item.label).includes(termo))
        }))
        .filter(secao => secao.itens.length > 0)
    : secoesAcessoInformacao

  const totalItensFiltrados = secoesFiltradas.reduce((soma, secao) => soma + secao.itens.length, 0)

  return (
    <div>
      <div className="max-w-lg mb-10">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40" size={20} />
          <input
            type="text"
            value={buscaInput}
            onChange={e => setBuscaInput(e.target.value)}
            placeholder="Buscar por título de item..."
            aria-label="Buscar por título de item"
            className="w-full border border-border/30 rounded-lg pl-10 pr-3 py-2.5 text-sm bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary outline-none transition-all"
          />
        </div>

        {termo && (
          <p className="text-xs text-text-muted mt-2" aria-live="polite">
            {totalItensFiltrados === 0
              ? 'Nenhum resultado'
              : `${totalItensFiltrados} ${totalItensFiltrados === 1 ? 'resultado encontrado' : 'resultados encontrados'}`}
          </p>
        )}
      </div>

      {secoesFiltradas.length === 0 ? (
        <EmptyState message="Nenhum item encontrado com esse termo de busca." />
      ) : (
        <div className="flex flex-col gap-10 pb-16">
          {secoesFiltradas.map(secao => (
            <SecaoAcesso key={secao.titulo} {...secao} />
          ))}
        </div>
      )}
    </div>
  )
}
