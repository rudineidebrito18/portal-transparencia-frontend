'use client'

import { FormEvent, useEffect, useState } from 'react'

import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeEditar } from '@/modules/auth/permissoes'
import { ApiError } from '@/services/api'
import { formatarData } from '@/utils/date'
import {
  EstruturaOrganizacional,
  estruturaOrganizacionalService
} from '@/modules/admin/institucional/estruturaOrganizacional.service'

const classeInputArquivo =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-admin-accent file:text-white file:text-sm file:font-semibold file:cursor-pointer file:transition-colors hover:file:bg-admin-accent-dark'

export default function EstruturaOrganizacionalAdminPage() {
  const { usuario } = useAuth()
  const podeSalvar = podeEditar(usuario, 'institucional')

  const [atual, setAtual] = useState<EstruturaOrganizacional | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    setLoading(true)
    setErro(null)

    estruturaOrganizacionalService
      .buscar()
      .then(setAtual)
      .catch((e: ApiError) => {
        // 404 = ainda não há PDF cadastrado, não é uma falha — formulário abre vazio.
        if (e.status !== 404) setErro(e.message ?? 'Erro ao carregar')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!arquivo) return

    setSalvando(true)
    setErroForm(null)

    try {
      const atualizado = await estruturaOrganizacionalService.atualizar(arquivo)
      setAtual(atualizado)
      setArquivo(null)
      setSalvo(true)
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      </div>
    )
  }

  if (erro) return <AdminErrorState message={erro} />

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-admin-text">Estrutura Organizacional</h1>
      <p className="text-sm text-admin-text-muted">
        PDF único exibido na página pública de Estrutura Organizacional. Enviar um novo arquivo substitui o atual.
      </p>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={!podeSalvar} className="space-y-4">
            {atual ? (
              <p className="text-sm text-admin-text-muted">
                Arquivo atual enviado em{' '}
                <span className="font-semibold text-admin-text">
                  {formatarData(atual.dataAtualizacao ?? undefined)}
                </span>
                {' — '}
                <a href={atual.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-admin-accent hover:underline">
                  ver arquivo atual
                </a>
              </p>
            ) : (
              <p className="text-sm text-admin-text-faint">Nenhum arquivo cadastrado ainda.</p>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor="arquivo">
                Arquivo PDF
              </label>
              <input
                id="arquivo"
                type="file"
                accept="application/pdf"
                required
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className={classeInputArquivo}
              />
            </div>
          </fieldset>

          {!podeSalvar && (
            <p className="text-xs text-admin-text-faint">Seu papel não permite editar essas informações.</p>
          )}

          {erroForm && <AdminErrorState message={erroForm} />}
          {salvo && <p className="text-sm text-admin-success font-semibold">Arquivo atualizado.</p>}

          {podeSalvar && (
            <button
              type="submit"
              disabled={salvando || !arquivo}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar arquivo'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
