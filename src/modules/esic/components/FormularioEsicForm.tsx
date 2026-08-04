'use client'

import { FormEvent, useState } from 'react'
import { MdCheckCircle, MdSend } from 'react-icons/md'

import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import { esicService } from '../esic.service'
import { FormularioEsicRequest, LABELS_TIPO_SOLICITACAO_ESIC, TipoSolicitacaoEsic } from '../types'

const FORM_VAZIO: FormularioEsicRequest = {
  tipoSolicitacao: 'SOLICITACAO_INFORMACAO',
  solicitacao: '',
  anonima: false,
  nome: '',
  email: ''
}

export default function FormularioEsicForm() {
  const [form, setForm] = useState<FormularioEsicRequest>(FORM_VAZIO)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)

    if (!form.anonima && (!form.nome?.trim() || !form.email?.trim())) {
      setErro('Informe nome e e-mail, ou marque a opção de envio anônimo.')
      return
    }

    setEnviando(true)

    try {
      await esicService.enviarFormulario({
        ...form,
        nome: form.anonima ? undefined : form.nome,
        email: form.anonima ? undefined : form.email
      })
      setEnviado(true)
      setForm(FORM_VAZIO)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar sua solicitação. Tente novamente.')
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
        <h3 className="font-bold text-primary mb-1">Solicitação enviada com sucesso</h3>
        <p className="text-sm text-text-secondary/70 mb-4">
          Sua solicitação foi registrada e será respondida dentro do prazo informado acima.
        </p>
        <button
          onClick={() => setEnviado(false)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Enviar outra solicitação
        </button>
      </Card>
    )
  }

  return (
    <Card hoverable={false} className="p-6">
      <h2 className="text-base font-bold text-primary uppercase mb-4">Fazer uma solicitação</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de solicitação</label>
          <select
            value={form.tipoSolicitacao}
            onChange={e => setForm({ ...form, tipoSolicitacao: e.target.value as TipoSolicitacaoEsic })}
            className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
          >
            {Object.entries(LABELS_TIPO_SOLICITACAO_ESIC).map(([valor, label]) => (
              <option key={valor} value={valor}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descreva sua solicitação</label>
          <textarea
            required
            rows={4}
            value={form.solicitacao}
            onChange={e => setForm({ ...form, solicitacao: e.target.value })}
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

        {erro && <ErrorState message={erro} />}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
        >
          <MdSend size={16} /> {enviando ? 'Enviando...' : 'Enviar solicitação'}
        </button>
      </form>
    </Card>
  )
}
