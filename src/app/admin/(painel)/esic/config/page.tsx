'use client'

import { FormEvent, useEffect, useState } from 'react'

import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeEditar } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { Unidade } from '@/modules/admin/geral/types'
import { esicInfoService } from '@/modules/admin/esic-ouvidoria/esic-ouvidoria.service'
import { EsicInfoRequest } from '@/modules/admin/esic-ouvidoria/types'

const FORM_VAZIO: EsicInfoRequest = {
  enderecoAtendimento: '',
  horarioInicioManha: '',
  horarioFimManha: '',
  horarioInicioTarde: '',
  horarioFimTarde: '',
  telefone: '',
  email: '',
  nomeResponsavel: '',
  unidadeResponsavelId: 0,
  prazoRespostaDisponivel: 20,
  prazoRespostaBusca: 10
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

export default function EsicConfigAdminPage() {
  const { usuario } = useAuth()
  const podeSalvar = podeEditar(usuario, 'esic-ouvidoria')

  const [form, setForm] = useState<EsicInfoRequest>(FORM_VAZIO)
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

    Promise.all([esicInfoService.buscar(), unidadesService.listar({ size: 200, sort: 'nome,asc' })])
      .then(([info, paginaUnidades]) => {
        const listaUnidades = paginaUnidades.content
        setUnidades(listaUnidades)

        if (!info) {
          setAindaNaoConfigurado(true)
          return
        }

        // Backend devolve LocalTime como "HH:mm:ss" — <input type="time"> sem
        // step de segundos espera "HH:mm".
        setForm({
          enderecoAtendimento: info.enderecoAtendimento,
          horarioInicioManha: info.horarioInicioManha.slice(0, 5),
          horarioFimManha: info.horarioFimManha.slice(0, 5),
          horarioInicioTarde: info.horarioInicioTarde.slice(0, 5),
          horarioFimTarde: info.horarioFimTarde.slice(0, 5),
          telefone: info.telefone,
          email: info.email,
          nomeResponsavel: info.nomeResponsavel,
          unidadeResponsavelId: info.unidadeResponsavelId,
          prazoRespostaDisponivel: info.prazoRespostaDisponivel,
          prazoRespostaBusca: info.prazoRespostaBusca
        })
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [])

  function atualizarCampo<K extends keyof EsicInfoRequest>(campo: K, valor: EsicInfoRequest[K]) {
    setForm(f => ({ ...f, [campo]: valor }))
    setSalvo(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setSalvando(true)
    setErroForm(null)

    try {
      await esicInfoService.atualizar(form)
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
      <h1 className="text-lg font-bold text-admin-text">E-SIC — Configuração de Atendimento</h1>

      {aindaNaoConfigurado && (
        <p className="text-sm text-admin-text-muted">
          Ainda não há configuração cadastrada — preencha e salve para criar.
        </p>
      )}

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={!podeSalvar} className="space-y-4">
            <div>
              <label className={classeLabel} htmlFor="enderecoAtendimento">Endereço de atendimento</label>
              <input
                id="enderecoAtendimento"
                required
                value={form.enderecoAtendimento}
                onChange={e => atualizarCampo('enderecoAtendimento', e.target.value)}
                className={classeInput}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={classeLabel} htmlFor="horarioInicioManha">Início manhã</label>
                <input
                  id="horarioInicioManha"
                  type="time"
                  required
                  value={form.horarioInicioManha}
                  onChange={e => atualizarCampo('horarioInicioManha', e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="horarioFimManha">Fim manhã</label>
                <input
                  id="horarioFimManha"
                  type="time"
                  required
                  value={form.horarioFimManha}
                  onChange={e => atualizarCampo('horarioFimManha', e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="horarioInicioTarde">Início tarde</label>
                <input
                  id="horarioInicioTarde"
                  type="time"
                  required
                  value={form.horarioInicioTarde}
                  onChange={e => atualizarCampo('horarioInicioTarde', e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="horarioFimTarde">Fim tarde</label>
                <input
                  id="horarioFimTarde"
                  type="time"
                  required
                  value={form.horarioFimTarde}
                  onChange={e => atualizarCampo('horarioFimTarde', e.target.value)}
                  className={classeInput}
                />
              </div>
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
                <label className={classeLabel} htmlFor="nomeResponsavel">Responsável</label>
                <input
                  id="nomeResponsavel"
                  required
                  value={form.nomeResponsavel}
                  onChange={e => atualizarCampo('nomeResponsavel', e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="unidadeResponsavelId">Unidade responsável</label>
                <select
                  id="unidadeResponsavelId"
                  required
                  value={form.unidadeResponsavelId || ''}
                  onChange={e => atualizarCampo('unidadeResponsavelId', Number(e.target.value))}
                  className={classeInput}
                >
                  <option value="" disabled>Selecione...</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="prazoRespostaDisponivel">Prazo de resposta (dias)</label>
                <input
                  id="prazoRespostaDisponivel"
                  type="number"
                  min={1}
                  required
                  value={form.prazoRespostaDisponivel}
                  onChange={e => atualizarCampo('prazoRespostaDisponivel', Number(e.target.value))}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="prazoRespostaBusca">Prazo de busca/prorrogação (dias)</label>
                <input
                  id="prazoRespostaBusca"
                  type="number"
                  min={1}
                  required
                  value={form.prazoRespostaBusca}
                  onChange={e => atualizarCampo('prazoRespostaBusca', Number(e.target.value))}
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
