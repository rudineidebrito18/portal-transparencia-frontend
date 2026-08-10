'use client'

import { FormEvent, useEffect, useState } from 'react'

import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeEditar } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { Unidade } from '@/modules/admin/geral/types'
import { ouvidoriaInfoService } from '@/modules/admin/esic-ouvidoria/esic-ouvidoria.service'
import { OuvidoriaInfoRequest } from '@/modules/admin/esic-ouvidoria/types'

const FORM_VAZIO: OuvidoriaInfoRequest = {
  endereco: '',
  horarioAtendimento: '',
  telefone: '',
  email: '',
  responsavel: '',
  prazos: '',
  unidadeId: 0
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

export default function OuvidoriaConfigAdminPage() {
  const { usuario } = useAuth()
  const podeSalvar = podeEditar(usuario, 'esic-ouvidoria')

  const [form, setForm] = useState<OuvidoriaInfoRequest>(FORM_VAZIO)
  const [aindaNaoConfigurado, setAindaNaoConfigurado] = useState(false)
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    setLoading(true)
    setErro(null)

    Promise.all([ouvidoriaInfoService.buscar(), unidadesService.listar({ size: 200, sort: 'nome,asc' })])
      .then(([info, paginaUnidades]) => {
        const listaUnidades = paginaUnidades.content
        setUnidades(listaUnidades)

        if (!info) {
          setAindaNaoConfigurado(true)
          return
        }

        // GET não devolve o id da unidade, só o nome — tenta casar pelo nome
        // pra pré-selecionar; se não achar (nome mudou, unidade excluída),
        // deixa em branco e o admin escolhe de novo ao salvar.
        const unidadeCorrespondente = listaUnidades.find(u => u.nome === info.unidadeNome)

        setForm({
          endereco: info.endereco,
          horarioAtendimento: info.horarioAtendimento,
          telefone: info.telefone,
          email: info.email,
          responsavel: info.responsavel,
          prazos: info.prazos,
          unidadeId: unidadeCorrespondente?.id ?? 0
        })
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [])

  function atualizarCampo<K extends keyof OuvidoriaInfoRequest>(campo: K, valor: OuvidoriaInfoRequest[K]) {
    setForm(f => ({ ...f, [campo]: valor }))
    setSalvo(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setSalvando(true)
    setErroForm(null)

    try {
      await ouvidoriaInfoService.atualizar(form)
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
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-admin-border bg-admin-surface h-16 animate-pulse" aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (erro) return <AdminErrorState message={erro} />

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-admin-text">Ouvidoria — Configuração de Atendimento</h1>

      {aindaNaoConfigurado && (
        <p className="text-sm text-admin-text-muted">
          Ainda não há configuração cadastrada — preencha e salve para criar.
        </p>
      )}

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={!podeSalvar} className="space-y-4">
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
              <label className={classeLabel} htmlFor="horarioAtendimento">Horário de atendimento</label>
              <input
                id="horarioAtendimento"
                required
                placeholder="Ex: 08:00 às 14:00"
                value={form.horarioAtendimento}
                onChange={e => atualizarCampo('horarioAtendimento', e.target.value)}
                className={classeInput}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="responsavel">Responsável</label>
                <input
                  id="responsavel"
                  required
                  value={form.responsavel}
                  onChange={e => atualizarCampo('responsavel', e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="unidadeId">Unidade</label>
                <select
                  id="unidadeId"
                  required
                  value={form.unidadeId || ''}
                  onChange={e => atualizarCampo('unidadeId', Number(e.target.value))}
                  className={classeInput}
                >
                  <option value="" disabled>Selecione...</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="prazos">Prazos para resposta</label>
              <input
                id="prazos"
                required
                placeholder="Ex: Até 20 dias úteis"
                value={form.prazos}
                onChange={e => atualizarCampo('prazos', e.target.value)}
                className={classeInput}
              />
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
