'use client'

import { FormEvent, useEffect, useState } from 'react'

import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
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
  endereco: ''
}

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
          endereco: info.endereco
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
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    )
  }

  if (erro) return <ErrorState message={erro} />

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-primary">Diário Oficial — Configuração</h1>

      <Card className="p-6" hoverable={false}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={!podeSalvar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  required
                  value={form.name}
                  onChange={e => atualizarCampo('name', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ISSN</label>
                <input
                  required
                  value={form.issn}
                  onChange={e => atualizarCampo('issn', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => atualizarCampo('email', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  required
                  value={form.telefone}
                  onChange={e => atualizarCampo('telefone', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Editor-chefe</label>
                <input
                  required
                  value={form.editorChefe}
                  onChange={e => atualizarCampo('editorChefe', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Redação</label>
                <input
                  required
                  value={form.redacao}
                  onChange={e => atualizarCampo('redacao', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input
                required
                value={form.endereco}
                onChange={e => atualizarCampo('endereco', e.target.value)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Brasão</label>
                {atual && (
                  <img src={atual.pathBrasao} alt="Brasão atual" className="h-16 mb-2 object-contain" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={e => setBrasao(e.target.files?.[0] ?? null)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logomarca</label>
                {atual && (
                  <img src={atual.pathLogo} alt="Logomarca atual" className="h-16 mb-2 object-contain" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={e => setLogo(e.target.files?.[0] ?? null)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-semibold"
                />
              </div>
            </div>
            <p className="text-xs text-text-secondary/60">
              O backend exige reenviar os dois arquivos em toda atualização, mesmo pra mudar só um campo de texto.
            </p>
          </fieldset>

          {!podeSalvar && (
            <p className="text-xs text-text-secondary/60">
              Seu papel não permite editar essas informações.
            </p>
          )}

          {erroForm && <ErrorState message={erroForm} />}
          {salvo && <p className="text-sm text-success font-semibold">Alterações salvas.</p>}

          {podeSalvar && (
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          )}
        </form>
      </Card>
    </div>
  )
}
