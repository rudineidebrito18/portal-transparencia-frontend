export interface Convenio {
  id: number
  numero: number
  convenente: string
  objeto: string
  internveniente: string
  dataAssinatura: string
  inicioVigencia: string
  fimVigencia: string
  valorConvenio: number
  valorContrapartida: number
  valorConcedente: number
  caminhoPdf: string | null
}

export type ConvenioRequest = Omit<Convenio, 'id' | 'caminhoPdf'>
