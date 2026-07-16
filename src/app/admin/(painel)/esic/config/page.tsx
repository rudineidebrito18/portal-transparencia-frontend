'use client'

import { FormEvent, useEffect, useState } from 'react'

import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
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

    Promise.all([esicInfoService.buscar(), unidadesService.listar()])
      .then(([info, listaUnidades]) => {
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
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    )
  }

  if (erro) return <ErrorState message={erro} />

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-primary">E-SIC — Configuração de Atendimento</h1>

      {aindaNaoConfigurado && (
        <p className="text-sm text-text-secondary/70">
          Ainda não há configuração cadastrada — preencha e salve para criar.
        </p>
      )}

      <Card className="p-6" hoverable={false}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={!podeSalvar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Endereço de atendimento</label>
              <input
                required
                value={form.enderecoAtendimento}
                onChange={e => atualizarCampo('enderecoAtendimento', e.target.value)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Início manhã</label>
                <input
                  type="time"
                  required
                  value={form.horarioInicioManha}
                  onChange={e => atualizarCampo('horarioInicioManha', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fim manhã</label>
                <input
                  type="time"
                  required
                  value={form.horarioFimManha}
                  onChange={e => atualizarCampo('horarioFimManha', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Início tarde</label>
                <input
                  type="time"
                  required
                  value={form.horarioInicioTarde}
                  onChange={e => atualizarCampo('horarioInicioTarde', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fim tarde</label>
                <input
                  type="time"
                  required
                  value={form.horarioFimTarde}
                  onChange={e => atualizarCampo('horarioFimTarde', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  required
                  value={form.telefone}
                  onChange={e => atualizarCampo('telefone', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Responsável</label>
                <input
                  required
                  value={form.nomeResponsavel}
                  onChange={e => atualizarCampo('nomeResponsavel', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unidade responsável</label>
                <select
                  required
                  value={form.unidadeResponsavelId || ''}
                  onChange={e => atualizarCampo('unidadeResponsavelId', Number(e.target.value))}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
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
                <label className="block text-sm font-medium mb-1">Prazo de resposta (dias)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.prazoRespostaDisponivel}
                  onChange={e => atualizarCampo('prazoRespostaDisponivel', Number(e.target.value))}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prazo de busca/prorrogação (dias)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.prazoRespostaBusca}
                  onChange={e => atualizarCampo('prazoRespostaBusca', Number(e.target.value))}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
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
