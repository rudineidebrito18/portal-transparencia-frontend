'use client'

import { FormEvent, useEffect, useState } from 'react'

import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeEditar } from '@/modules/auth/permissoes'
import { emendaMunicipioConfigService } from '@/modules/admin/emendas-config/emendaMunicipioConfig.service'
import { EmendaMunicipioConfigRequest } from '@/modules/admin/emendas-config/types'

const FORM_VAZIO: EmendaMunicipioConfigRequest = {
  municipioNome: '',
  municipioUf: '',
  municipioCnpj: ''
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

export default function EmendasConfigAdminPage() {
  const { usuario } = useAuth()
  const podeSalvar = podeEditar(usuario, 'obras-repasses')

  const [form, setForm] = useState<EmendaMunicipioConfigRequest>(FORM_VAZIO)
  const [aindaNaoConfigurado, setAindaNaoConfigurado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    setLoading(true)
    setErro(null)

    emendaMunicipioConfigService.obter()
      .then(config => {
        if (!config) {
          setAindaNaoConfigurado(true)
          return
        }

        setForm({
          municipioNome: config.municipioNome,
          municipioUf: config.municipioUf,
          municipioCnpj: config.municipioCnpj
        })
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [])

  function atualizarCampo<K extends keyof EmendaMunicipioConfigRequest>(campo: K, valor: EmendaMunicipioConfigRequest[K]) {
    setForm(f => ({ ...f, [campo]: valor }))
    setSalvo(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setSalvando(true)
    setErroForm(null)

    try {
      await emendaMunicipioConfigService.atualizar(form)
      setAindaNaoConfigurado(false)
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
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-admin-border bg-admin-surface h-16 animate-pulse" aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (erro) return <AdminErrorState message={erro} />

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-admin-text">Emendas — Configuração de Município</h1>
      <p className="text-sm text-admin-text-muted">
        Município usado como filtro na varredura diária e na busca assistida das emendas federais
        e estaduais (Transferegov e Portal MA). Mudar aqui não exige reiniciar o servidor.
      </p>

      {aindaNaoConfigurado && (
        <p className="text-sm text-admin-text-muted">
          Ainda não há configuração cadastrada — preencha e salve para criar.
        </p>
      )}

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={!podeSalvar} className="space-y-4">
            <div>
              <label className={classeLabel} htmlFor="municipioNome">Nome do município</label>
              <input
                id="municipioNome"
                required
                placeholder="Como consta nas fontes oficiais — maiúsculo, sem acento costuma bater melhor"
                value={form.municipioNome}
                onChange={e => atualizarCampo('municipioNome', e.target.value)}
                className={classeInput}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="municipioUf">UF</label>
                <input
                  id="municipioUf"
                  required
                  maxLength={2}
                  placeholder="MA"
                  value={form.municipioUf}
                  onChange={e => atualizarCampo('municipioUf', e.target.value.toUpperCase())}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="municipioCnpj">CNPJ da prefeitura</label>
                <input
                  id="municipioCnpj"
                  required
                  placeholder="Só números"
                  value={form.municipioCnpj}
                  onChange={e => atualizarCampo('municipioCnpj', e.target.value)}
                  className={classeInput}
                />
              </div>
            </div>
          </fieldset>

          {!podeSalvar && (
            <p className="text-xs text-admin-text-faint">
              Seu papel não permite editar essas informações.
            </p>
          )}

          {erroForm && <AdminErrorState message={erroForm} />}
          {salvo && <p className="text-sm text-admin-success font-semibold">Alterações salvas.</p>}

          {podeSalvar && (
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
