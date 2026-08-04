'use client'

import { FormEvent, useState } from 'react'
import { MdCheckCircle, MdSend } from 'react-icons/md'

import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import { useAsyncData } from '@/hooks/useAsyncData'
import { secretariasService } from '@/modules/secretarias/secretarias.service'
import { ouvidoriaService } from '../ouvidoria.service'
import { FinalidadeOuvidoria, FormularioOuvidoriaRequest, LABELS_FINALIDADE_OUVIDORIA } from '../types'

const FORM_VAZIO: FormularioOuvidoriaRequest = {
  unidadeId: 0,
  finalidade: 'RECLAMACAO',
  anonima: false,
  nome: '',
  email: '',
  comentario: ''
}

export default function FormularioOuvidoriaForm() {
  const { data: unidades } = useAsyncData(() => secretariasService.listar(), [], [])

  const [form, setForm] = useState<FormularioOuvidoriaRequest>(FORM_VAZIO)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)

    if (!form.unidadeId) {
      setErro('Selecione o órgão a que se destina a manifestação.')
      return
    }

    if (!form.anonima && (!form.nome?.trim() || !form.email?.trim())) {
      setErro('Informe nome e e-mail, ou marque a opção de envio anônimo.')
      return
    }

    setEnviando(true)

    try {
      await ouvidoriaService.enviarFormulario(
        {
          ...form,
          nome: form.anonima ? undefined : form.nome,
          email: form.anonima ? undefined : form.email
        },
        arquivo
      )
      setEnviado(true)
      setForm(FORM_VAZIO)
      setArquivo(null)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar sua manifestação. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <Card hoverable={false} className="p-6 text-center">
        <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-success/10 text-success">
          <MdCheckCircle size={24} />
        </div>
        <h3 className="font-bold text-primary mb-1">Manifestação enviada com sucesso</h3>
        <p className="text-sm text-text-secondary/70 mb-4">
          Sua manifestação foi registrada e será tratada dentro do prazo informado acima.
        </p>
        <button
          onClick={() => setEnviado(false)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Enviar outra manifestação
        </button>
      </Card>
    )
  }

  return (
    <Card hoverable={false} className="p-6">
      <h2 className="text-base font-bold text-primary uppercase mb-4">Fazer uma manifestação</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Órgão destinatário</label>
            <select
              value={form.unidadeId || ''}
              onChange={e => setForm({ ...form, unidadeId: Number(e.target.value) })}
              className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
            >
              <option value="" disabled>Selecione...</option>
              {unidades.map(unidade => (
                <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Finalidade</label>
            <select
              value={form.finalidade}
              onChange={e => setForm({ ...form, finalidade: e.target.value as FinalidadeOuvidoria })}
              className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
            >
              {Object.entries(LABELS_FINALIDADE_OUVIDORIA).map(([valor, label]) => (
                <option key={valor} value={valor}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comentário</label>
          <textarea
            required
            rows={4}
            value={form.comentario}
            onChange={e => setForm({ ...form, comentario: e.target.value })}
            className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.anonima}
            onChange={e => setForm({ ...form, anonima: e.target.checked })}
          />
          Enviar de forma anônima
        </label>

        {!form.anonima && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                required
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Anexo (opcional — PDF, DOC ou XLS)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={e => setArquivo(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-text-secondary/70
              file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-sm file:font-semibold file:bg-primary file:text-white
              hover:file:bg-primary-dark file:cursor-pointer file:transition-all"
          />
          {arquivo && (
            <p className="text-xs text-text-secondary/70 mt-1">Selecionado: {arquivo.name}</p>
          )}
        </div>

        {erro && <ErrorState message={erro} />}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
        >
          <MdSend size={16} /> {enviando ? 'Enviando...' : 'Enviar manifestação'}
        </button>
      </form>
    </Card>
  )
}
