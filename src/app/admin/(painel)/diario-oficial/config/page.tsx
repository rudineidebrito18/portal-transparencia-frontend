'use client'

import { FormEvent, useEffect, useState } from 'react'

import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeEditar } from '@/modules/auth/permissoes'
import { diarioOficialInfoService } from '@/modules/admin/diario-oficial/diarioOficial.service'
import { DiarioOficialInfo, DiarioOficialInfoRequest } from '@/modules/admin/diario-oficial/types'

const FORM_VAZIO: DiarioOficialInfoRequest = {
  name: '',
  issn: '',
  email: '',
  telefone: '',
  editorChefe: '',
  redacao: '',
  endereco: '',
  periodicidade: '',
  quemSomos: ''
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'
const classeInputArquivo =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-admin-accent file:text-white file:text-sm file:font-semibold file:cursor-pointer file:transition-colors hover:file:bg-admin-accent-dark'

export default function DiarioOficialConfigAdminPage() {
  const { usuario } = useAuth()
  const podeSalvar = podeEditar(usuario, 'diario-oficial')

  const [atual, setAtual] = useState<DiarioOficialInfo | null>(null)
  const [form, setForm] = useState<DiarioOficialInfoRequest>(FORM_VAZIO)
  const [brasao, setBrasao] = useState<File | null>(null)
  const [logo, setLogo] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    setLoading(true)
    setErro(null)

    diarioOficialInfoService
      .buscar()
      .then(info => {
        setAtual(info)
        setForm({
          name: info.name,
          issn: info.issn,
          email: info.email,
          telefone: info.telefone,
          editorChefe: info.editorChefe,
          redacao: info.redacao,
          endereco: info.endereco,
          periodicidade: info.periodicidade ?? '',
          quemSomos: info.quemSomos ?? ''
        })
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [])

  function atualizarCampo<K extends keyof DiarioOficialInfoRequest>(campo: K, valor: DiarioOficialInfoRequest[K]) {
    setForm(f => ({ ...f, [campo]: valor }))
    setSalvo(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!brasao || !logo) return

    setSalvando(true)
    setErroForm(null)

    try {
      const atualizado = await diarioOficialInfoService.atualizar(form, brasao, logo)
      setAtual(atualizado)
      setBrasao(null)
      setLogo(null)
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
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-admin-border bg-admin-surface h-16 animate-pulse" aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (erro) return <AdminErrorState message={erro} />

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-admin-text">Diário Oficial — Configuração</h1>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={!podeSalvar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="name">Nome</label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={e => atualizarCampo('name', e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="issn">ISSN</label>
                <input
                  id="issn"
                  required
                  value={form.issn}
                  onChange={e => atualizarCampo('issn', e.target.value)}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => atualizarCampo('email', e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  required
                  value={form.telefone}
                  onChange={e => atualizarCampo('telefone', e.target.value)}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="editorChefe">Editor-chefe</label>
                <input
                  id="editorChefe"
                  required
                  value={form.editorChefe}
                  onChange={e => atualizarCampo('editorChefe', e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="redacao">Redação</label>
                <input
                  id="redacao"
                  required
                  value={form.redacao}
                  onChange={e => atualizarCampo('redacao', e.target.value)}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="endereco">Endereço</label>
              <input
                id="endereco"
                required
                value={form.endereco}
                onChange={e => atualizarCampo('endereco', e.target.value)}
                className={classeInput}
              />
            </div>

            <div>
              <label className={classeLabel} htmlFor="periodicidade">Periodicidade</label>
              <input
                id="periodicidade"
                required
                placeholder="Ex: Diariamente, exceto sábados, domingos e feriados"
                value={form.periodicidade}
                onChange={e => atualizarCampo('periodicidade', e.target.value)}
                className={classeInput}
              />
            </div>

            <div>
              <label className={classeLabel} htmlFor="quemSomos">Quem Somos</label>
              <textarea
                id="quemSomos"
                required
                rows={4}
                placeholder="Texto de apresentação exibido na aba &quot;Quem Somos&quot; do Diário Oficial público"
                value={form.quemSomos}
                onChange={e => atualizarCampo('quemSomos', e.target.value)}
                className={classeInput}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="brasao">Brasão</label>
                {atual && (
                  <img src={atual.pathBrasao} alt="Brasão atual" className="h-16 mb-2 object-contain" />
                )}
                <input
                  id="brasao"
                  type="file"
                  accept="image/*"
                  required
                  onChange={e => setBrasao(e.target.files?.[0] ?? null)}
                  className={classeInputArquivo}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="logo">Logomarca</label>
                {atual && (
                  <img src={atual.pathLogo} alt="Logomarca atual" className="h-16 mb-2 object-contain" />
                )}
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  required
                  onChange={e => setLogo(e.target.files?.[0] ?? null)}
                  className={classeInputArquivo}
                />
              </div>
            </div>
            <p className="text-xs text-admin-text-faint">
              O backend exige reenviar os dois arquivos em toda atualização, mesmo pra mudar só um campo de texto.
            </p>
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
