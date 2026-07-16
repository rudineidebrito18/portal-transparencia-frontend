'use client'

import { FormEvent, useEffect, useState } from 'react'

import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
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

    Promise.all([ouvidoriaInfoService.buscar(), unidadesService.listar()])
      .then(([info, listaUnidades]) => {
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
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    )
  }

  if (erro) return <ErrorState message={erro} />

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-primary">Ouvidoria — Configuração de Atendimento</h1>

      {aindaNaoConfigurado && (
        <p className="text-sm text-text-secondary/70">
          Ainda não há configuração cadastrada — preencha e salve para criar.
        </p>
      )}

      <Card className="p-6" hoverable={false}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={!podeSalvar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input
                required
                value={form.endereco}
                onChange={e => atualizarCampo('endereco', e.target.value)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Horário de atendimento</label>
              <input
                required
                placeholder="Ex: 08:00 às 14:00"
                value={form.horarioAtendimento}
                onChange={e => atualizarCampo('horarioAtendimento', e.target.value)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
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
                  value={form.responsavel}
                  onChange={e => atualizarCampo('responsavel', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unidade</label>
                <select
                  required
                  value={form.unidadeId || ''}
                  onChange={e => atualizarCampo('unidadeId', Number(e.target.value))}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="" disabled>Selecione...</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prazos para resposta</label>
              <input
                required
                placeholder="Ex: Até 20 dias úteis"
                value={form.prazos}
                onChange={e => atualizarCampo('prazos', e.target.value)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
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
