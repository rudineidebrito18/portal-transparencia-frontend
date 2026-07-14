# Status do Projeto — Portal da Transparência (Frontend)

> Gerado em 2026-07-13. Serve como ponto de retomada: o que existe, os padrões a seguir e o que falta.

## 1. Visão geral

Frontend Next.js (App Router) que consome um backend Spring Boot local
(`http://localhost:8080/api`, spec OpenAPI em `http://localhost:8080/v3/api-docs`).
`.env.local` controla o modo de dados:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_USE_MOCK=true
```

Com `USE_MOCK=true` (padrão), todo `*.service.ts` cai num mock local com `@faker-js/faker`
em vez de bater no backend — então "funciona no `npm run dev`" **não confirma** que o
endpoint real existe ou tem esse formato. Sempre conferir contra o spec antes de criar
um módulo novo (ver seção 4).

## 2. Página hub `/transparencia`

`src/app/transparencia/page.tsx` + `src/modules/transparencia/data/secoes.ts` — espelha a
estrutura de acessoainformacao de um portal de referência (bomlugar.ma.gov.br), em 13 seções
com cards. Cada item tem `label`, `icon` e opcionalmente `href`. **Sem `href` = "Em breve"**
(card desabilitado) — normalmente porque o endpoint ainda não existe no backend, não porque
esqueci de linkar.

## 3. Módulos já implementados

Pré-existentes (antes desta leva de trabalho): `home`, `institucional` (notícias/avisos),
`diario-oficial`, `noticias`, `avisos`, `licitacoes`, `contratos` (detalhe),
`servidores`, `folha-pagamento` (recursos-humanos), `gestao-fiscal` (5 abas), `educacao`
(4 abas), `planejamento` (3 abas: ldo/loa/ppa), `prestacao-contas` (5 abas).

Criados nesta sessão, todos confirmados contra o OpenAPI real:

| Módulo | Rota | Padrão | Backend |
|---|---|---|---|
| Saúde | `/saude` | genérico, 4 abas | `/saude/{planos,relatorios,medicamentos,unidade}/filtro` |
| Legislação | `/legislacao` | genérico, recurso único | `/legislacao/lei/filtro` |
| Obras Públicas | `/obras` | bespoke, sem paginação | `GET /obras` (array completo, sem `/filtro`) |
| E-SIC | `/esic` | info singleton, leitura | `GET /esic/infos` |
| Ouvidoria | `/ouvidoria` | info singleton, leitura | `GET /ouvidoria/info` |
| Convênios | `/convenios` | genérico + período, 3 abas | `/convenios-transferencias-{recebidas,realizadas}/filtro`, `/convenios/acordos-firmados-orgao/filtro` |
| Diárias | `/diarias` | bespoke, filtro próprio | `GET /diarias/buscar` |
| Tabela de Valores das Diárias | `/tabela-valores` | genérico + enum tipo | `GET /tabela-valores/buscar` |
| Fiscal de Contrato | `/fiscal-contrato` | genérico, recurso único | `/licitacao/fiscal-contratos/filtro` |
| Estagiários / Terceirizados | `/recursos-humanos` | genérico, 2 abas | `/recursos-humanos/{estagiarios,terceirizados}/filtro` |
| Plano Estratégico / RGA | `/planejamento` (4ª/5ª aba) | genérico | `/planejamento/{plano-estrategico,rga}/filtro` |
| Contratos Administrativos | `/contratos` | bespoke paginado, sem filtro | `GET /licitacoes/contratos` (endpoint já existia, só faltava a lista no frontend) |
| Emendas Parlamentares | `/emendas-parlamentares` | bespoke, filtro tipo/ano exclusivo | `GET /emendas-parlamentares` + `/tipo/{tipo}` + `/ano/{ano}` (endpoints separados) |
| Concursos e Seleções Públicas | `/concursos` | bespoke, sem paginação, anexos aninhados | `GET /recursos-humanos/concursos` + `/concursos/{id}/anexos` |
| Estrutura Organizacional / Organograma | `/estrutura-organizacional`, `/organograma` | PDF estático, sem backend | nenhum — `PdfViewer` aponta pra `/test.pdf` (placeholder, trocar quando houver o arquivo real) |
| Diárias — legislação e valores | `/diarias-legislacao` | PDF estático, sem backend | nenhum — mesmo padrão acima |
| FAQ | `/faq` | página estática (`<details>`/`<summary>`) | nenhum — conteúdo genérico, editar livremente |
| LGPD e Governo Digital | `/lgpd` | página estática, cobre os 5 itens da seção | nenhum — conteúdo institucional genérico |
| Radar da Transparência | link externo (`radardatransparencia.atricon.org.br`) | `ItemAcessoCard` abre em nova aba quando `href` começa com `http` | — |
| RREO | `/gestao-fiscal?categoria=execucao-orcamentaria` | reaproveita aba já existente | `GET /gestao-fiscal/relatorio-execucao-orcamentaria` (só faltava o href) |

## 4. Como conferir o contrato real do backend

```bash
curl -s http://localhost:8080/v3/api-docs | python3 -m json.tool
```

Dois formatos de DTO já em uso — decida qual usar **antes** de codar:

- **Documento genérico** — `{id, descricao, data, caminhoArquivo}` via
  `GET /{basePath}/{recurso}/filtro` + `GenericDocumentoFiltroDto`. Reaproveita
  `src/modules/shared/services/documentoGenerico.service.ts` (`criarServicoDocumentoGenerico`),
  `.../mocks/documentoGenericoMock.ts` e `.../hooks/useDocumentosGenerico.ts`
  (`criarUseDocumentosGenerico`). É o caminho mais rápido — confirme o schema no spec antes,
  mas se bater com esse formato é ~4 arquivos pequenos + a rota.
- **Bespoke paginado** — DTO com campos próprios, mas ainda pagina/filtra no backend.
  Usa `usePageableResource<T, F>` (`src/hooks/usePageableResource.ts`) direto, sem o wrapper
  genérico. Precedentes: `servidor`, `diarias`, os 3 sub-recursos de `convenios`.
- **Bespoke sem paginação** — `GET` retorna array completo, sem `/filtro`, sem `Pageable`.
  Usa `useAsyncData` (`src/hooks/useAsyncData.ts`) + `AsyncList`
  (`src/components/ui/AsyncList.tsx`). Precedentes: `gestao-fiscal` (dívida ativa,
  inidôneas), `obras`.
- **Info singleton** — `GET` retorna um objeto único (não lista, não paginado).
  Também usa `useAsyncData`, mas com `valorInicial: null` e sem loop de cards.
  Precedentes: `esic`, `ouvidoria`.
- **PDF estático, sem backend** — pra itens que são só um documento publicado esporadicamente
  (sem CRUD, sem listagem), não vale a pena esperar endpoint de backend. Usa o componente
  `src/components/ui/PdfViewer.tsx` (iframe + botão de baixar) direto no `page.tsx`, com o
  caminho do arquivo como constante local marcada `// TODO`. Precedentes: `estrutura-organizacional`,
  `organograma`. Bom candidato pra outros itens da lista "sem endpoint" da seção 5 que também
  sejam documentos fixos (ex: Carta de serviços, Regulamentação da LAI).

Outras convenções a manter:
- Rota do frontend (`src/app/<rota>`) espelha o basePath do backend 1:1.
- Abas dentro de uma rota (`?categoria=x`) só quando os sub-recursos **compartilham o mesmo
  basePath** no backend — senão são rotas separadas (ex: `/planejamento` vs `/prestacao-contas`,
  mesmo estando na mesma seção da página `/transparencia`).
- Estado compartilhável (aba ativa, filtros, página) sempre na URL via `useUrlState` /
  `usePageableResource`, nunca em `useState` puro.
- Breadcrumb de qualquer página alcançável a partir do hub: `Início > Transparência > ...`.
- Item do hub que aponta pra outro site (não uma rota interna): `href` começa com `http` e o
  `ItemAcessoCard` detecta isso sozinho — abre em nova aba com `rel="noopener noreferrer"` em
  vez de `next/link`. Precedente: "Radar da transparência pública".
- Não existe suíte de testes configurada no projeto (sem jest/vitest) — não há padrão a seguir
  aqui ainda.

## 5. Próximos passos sugeridos (por prioridade / facilidade)

Todos os endpoints do formato documento genérico já confirmados foram implementados. Uma
auditoria completa das tags do spec (2026-07-14) contra os itens sem `href` do hub encontrou
mais alguns endpoints que existem mas ainda não têm código no frontend:

1. **Tabela com padrão remuneratório** — `GET /recursos-humanos/cargos` (array simples: cargo,
   quantidade, valorBruto, valorDesconto, valorLiquido, media). Mesmo padrão bespoke sem
   paginação de `obras`/`concursos`.
2. **Transferências disciplinadas pela EC nº 105** — `GET /execucao-orcamentaria/transferencia-voluntaria/filtro`,
   formato documento genérico. **Confiança moderada no mapeamento**: o nome do endpoint
   ("Transferência Voluntária") é genérico, não menciona EC 105 explicitamente — confirmar
   com quem administra o backend antes de assumir que é o recurso certo.
3. **Ato de adesão** — não é endpoint novo: dá pra reaproveitar `/licitacoes` filtrando
   `tipoProcedimentoLicitacao=AARP` (Adesão à Ata de Registro de Preços já é um valor do enum
   `TipoProcedimentoLicitacao`).
4. **Dispensas e inexigibilidade** — mesma ideia, mas os tipos `DP`/`DEL`/`IN` exigiriam filtro
   multi-valor em `FiltroLicitacao.tipoProcedimentoLicitacao`, que hoje só aceita 1 valor por vez.
5. **Detalhe de Obra Pública** — `/obras` já tem sub-recursos não usados no frontend: ARTs
   (`/obras/{id}/arts`), Anexos (`/obras/{id}/anexos`) e Medições (`/obras/{id}/medicoes`).
   Não mapeia a nenhum card específico do hub, mas daria pra criar uma página de detalhe
   `/obras/[id]`.

Decididos explicitamente pelo usuário em 2026-07-14 como **não prioritários por enquanto**
(não implementar sem pedido explícito): PCA, Chamamento público, Ordem cronológica, Ata de
registro de preço, Relatório circunstanciado, Regulamentação da LAI, Prazos de resposta SIC,
Relatório anual estatístico, Documentos (des)classificados, Carta de serviços, Lista de espera
de saúde, Estoque de medicamentos, Conselho de saúde, Conselho do FUNDEB, Conselho de
assistência social.

Sem endpoint no backend e sem decisão do usuário ainda: Audiências públicas.

## 6. Limitações conhecidas desta sessão

- Não há Playwright/chromium-cli no ambiente — toda verificação de UI foi feita via `curl` +
  inspeção do HTML server-renderizado (funciona pra SSR/breadcrumbs, mas não observa o que os
  hooks client-side (`useEffect`) realmente renderizam depois de montado). Recomendo rodar
  `/run-skill-generator` ou instalar Playwright se for continuar dependendo de verificação
  visual automatizada.
- O servidor de dev caiu sozinho pelo menos uma vez no meio da sessão (motivo não
  investigado — só reiniciei com `npm run dev`).
- `/obras` não tem filtro nem paginação no backend; "Obras Paralisadas" filtra client-side
  sobre a lista inteira já carregada (foge do padrão "filtro sempre no backend" só porque o
  backend não oferece outra opção pra esse recurso específico).
- `nohup npm run dev & disown` neste ambiente às vezes não solta de vez o TTY (processo continua
  com controlling terminal em vez de "?"), então um `pkill -f "next dev"` simples pode não
  encerrar tudo. Depois de cada rodada de teste, confirme com `ps aux | grep -i next` e mate
  os PIDs residuais explicitamente antes de subir um novo servidor — senão acabam dois
  processos disputando a porta 3000/3001 ao mesmo tempo.

## 7. Como retomar

```bash
npm run dev                                    # sobe o frontend em :3000
curl -s http://localhost:8080/v3/api-docs       # confirma o backend e pega o spec atualizado
```

Antes de criar qualquer módulo novo: puxar o spec de novo (pode ter mudado), achar o DTO no
`components.schemas`, comparar com os 4 formatos da seção 4, e só then escrever código.
