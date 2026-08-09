'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useState } from 'react'

import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeEditar } from '@/modules/auth/permissoes'
import { Autoridade, AutoridadeRequest } from '@/modules/admin/geral/types'

interface Props {
  titulo: string
  cargoPadrao: string
  service: {
    buscar(): Promise<Autoridade | null>
    atualizar(dados: AutoridadeRequest, foto?: File | null): Promise<Autoridade>
  }
}

function formVazio(cargoPadrao: string): AutoridadeRequest {
  return {
    nome: '',
    nomePopular: '',
    cargo: cargoPadrao,
    atribuicoes: '',
    email: '',
    telefone: '',
    dataInicioMandato: '',
    dataFimMandato: ''
  }
}

// Compartilhado entre /admin/geral/prefeito e /admin/geral/vice-prefeito — os dois são
// singletons independentes (sem vínculo/FK entre si nem com Unidade), formato idêntico,
// só o service (endpoint) e o título mudam. Mesmo padrão upsert 404-antes-de-configurar
// de EsicConfigAdminPage, com upload de foto igual UnidadesAdminPage.
export default function AutoridadeConfigPage({ titulo, cargoPadrao, service }: Props) {
  const { usuario } = useAuth()
  const podeSalvar = podeEditar(usuario, 'geral')

  const [form, setForm] = useState<AutoridadeRequest>(formVazio(cargoPadrao))
  const [fotoAtualUrl, setFotoAtualUrl] = useState<string | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [aindaNaoConfigurado, setAindaNaoConfigurado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    setLoading(true)
    setErro(null)

    service
      .buscar()
      .then(info => {
        if (!info) {
          setAindaNaoConfigurado(true)
          return
        }

        setForm({
          nome: info.nome,
          nomePopular: info.nomePopular ?? '',
          cargo: info.cargo,
          atribuicoes: info.atribuicoes,
          email: info.email,
          telefone: info.telefone ?? '',
          dataInicioMandato: info.dataInicioMandato ?? '',
          dataFimMandato: info.dataFimMandato ?? ''
        })
        setFotoAtualUrl(info.fotoUrl)
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function atualizarCampo<K extends keyof AutoridadeRequest>(campo: K, valor: AutoridadeRequest[K]) {
    setForm(f => ({ ...f, [campo]: valor }))
    setSalvo(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setSalvando(true)
    setErroForm(null)

    const dados: AutoridadeRequest = {
      ...form,
      nomePopular: form.nomePopular || undefined,
      telefone: form.telefone || undefined,
      dataInicioMandato: form.dataInicioMandato || undefined,
      dataFimMandato: form.dataFimMandato || undefined
    }

    try {
      const atualizado = await service.atualizar(dados, foto)
      setAindaNaoConfigurado(false)
      setFotoAtualUrl(atualizado.fotoUrl)
      setFoto(null)
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
      <h1 className="text-lg font-bold text-primary">{titulo}</h1>

      {aindaNaoConfigurado && (
        <p className="text-sm text-text-secondary/70">
          Ainda não há perfil cadastrado — preencha e salve para criar.
        </p>
      )}

      <Card className="p-6" hoverable={false}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={!podeSalvar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="nome">Nome completo</label>
                <input
                  id="nome"
                  required
                  value={form.nome}
                  onChange={e => atualizarCampo('nome', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="nomePopular">Nome popular (opcional)</label>
                <input
                  id="nomePopular"
                  value={form.nomePopular ?? ''}
                  onChange={e => atualizarCampo('nomePopular', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                  placeholder="Como é conhecido publicamente"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="cargo">Cargo</label>
              <input
                id="cargo"
                required
                value={form.cargo}
                onChange={e => atualizarCampo('cargo', e.target.value)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="atribuicoes">Atribuições</label>
              <textarea
                id="atribuicoes"
                required
                rows={4}
                value={form.atribuicoes}
                onChange={e => atualizarCampo('atribuicoes', e.target.value)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={form.email}
                  onChange={e => atualizarCampo('email', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="telefone">Telefone (opcional)</label>
                <input
                  id="telefone"
                  value={form.telefone ?? ''}
                  onChange={e => atualizarCampo('telefone', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                  placeholder="Se vazio, o site público usa o telefone do Gabinete do Prefeito"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="dataInicioMandato">Início do mandato (opcional)</label>
                <input
                  type="date"
                  id="dataInicioMandato"
                  value={form.dataInicioMandato ?? ''}
                  onChange={e => atualizarCampo('dataInicioMandato', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="dataFimMandato">Fim do mandato (opcional)</label>
                <input
                  type="date"
                  id="dataFimMandato"
                  min={form.dataInicioMandato || undefined}
                  value={form.dataFimMandato ?? ''}
                  onChange={e => atualizarCampo('dataFimMandato', e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="foto">
                Foto {fotoAtualUrl && '(opcional — mantém a atual se vazio)'}
              </label>
              {fotoAtualUrl && (
                <Image
                  src={fotoAtualUrl}
                  alt="Foto atual"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover mb-2"
                />
              )}
              <input
                id="foto"
                type="file"
                accept="image/*"
                onChange={e => setFoto(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-text-secondary/70
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:bg-primary file:text-white
                  hover:file:bg-primary-dark file:cursor-pointer file:transition-all"
              />
              {foto && <p className="text-xs text-text-secondary/70 mt-1">Selecionada: {foto.name}</p>}
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
