import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  'carta-servicos': ['Carta de Serviços ao Usuário']
}

// Só 2 versões fake (uma por ano) — na prática esse documento é atualizado raramente,
// diferente dos outros módulos genéricos (relatórios mensais/anuais recorrentes).
export const cartaServicosMock = criarMockDocumentoGenerico<'carta-servicos'>(
  DESCRICOES,
  'institucional',
  2
)
