# Status do Projeto — Portal da Transparência (Frontend)

> Ponto de retomada: o que existe, os padrões a seguir, o que falta. Histórico detalhado de
> bugs/decisões de cada sessão fica no `git log`, não aqui.

## 1. Visão geral

Frontend Next.js (App Router) que consome um backend Spring Boot local
(`http://localhost:8080/api`, spec OpenAPI em `http://localhost:8080/v3/api-docs`).
Repositório do backend: `~/Documentos/ProjetoPref/portal-transparencia-pref` (repare no
`ProjetoPref/` no meio do caminho — já apareceu documentado errado sem esse segmento).

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_USE_MOCK=true
```

Com `USE_MOCK=true`, os `*.service.ts` **do site público mais antigo** (`obras`, `institucional`
etc.) caem num mock local com `@faker-js/faker` em vez de bater no backend — então "funciona no
`npm run dev`" não confirma que o endpoint real existe ou tem esse formato. Módulos criados a
partir da fase do painel admin (tudo em `src/modules/admin/*` e módulos públicos mais recentes
como `secretarias`) não têm mock — sempre chamam o backend real. Sempre conferir o spec/código do
backend antes de criar algo novo (seção 3).

## 2. Módulos implementados

### Site público

A maior parte das seções do hub `/transparencia` (`src/modules/transparencia/data/secoes.ts`)
já está implementada seguindo os padrões da seção 3. Itens sem `href` no hub = "Em breve"
(endpoint ainda não existe no backend ou não foi priorizado — não é esquecimento).

Módulos com padrão bespoke (fogem do CRUD genérico, vale saber antes de mexer):
- `/obras` — sem filtro/paginação no backend; "Obras Paralisadas" filtra client-side.
- `/licitacoes`, `/contratos`, `/servidores` — detalhe em Server Component (`[id]/page.tsx`
  async, `notFound()` + `not-found.tsx`), não hook client-side.
- `/secretarias` + `/secretarias/[id]` — lista client-side com busca/filtro de vigência via
  `useUrlState`; detalhe é Server Component que faz 6 chamadas em paralelo (unidade + 5
  sub-recursos: decretos, documentos tipados, ex-gestores, ordenadores, setores) porque o
  backend não agrega isso na resposta da unidade.
- `/estrutura-organizacional`, `/organograma`, `/diarias-legislacao` — PDF estático via
  `PdfViewer`, sem backend (`/test.pdf` placeholder).
- `/diario-oficial` — fluxo de publicação mais simples (busca com filtros); o site público só
  lê `EdicaoDiario` já publicada. O fluxo de aprovação/assinatura em si é admin (seção seguinte).

### Painel administrativo (`/admin/*`)

Login via `POST /users/login` (fora do prefixo `/api`). JWT não carrega roles nem id —
`detectarPapeisEId` (`src/modules/auth/auth.service.ts`) usa `GET /api/admin/users` como sonda
(200 = `ROLE_ADMINISTRATOR`, 403 = `ROLE_MANAGER`). `middleware.ts` barra `/admin/*` sem cookie
só por UX — a proteção real é o backend (Spring Security barra `POST`/`PUT`/`DELETE` sem sessão
válida). RBAC em `src/modules/auth/permissoes.ts` (`podeCriar`/`podeEditar`/`podeExcluir` por
`GrupoModulo`).

Layout (`src/app/admin/(painel)/layout.tsx` + `AdminSidebar.tsx`): container `h-screen
overflow-hidden`, `<main>` com `overflow-y-auto` — só o conteúdo rola, a sidebar fica travada na
altura da tela (o menu interno dela já tinha `overflow-y-auto` próprio, mas só passou a
funcionar de verdade depois dessa mudança). Manter esse padrão em qualquer ajuste de layout do
painel — não voltar pro `min-h-screen` na raiz, que faz a página inteira crescer e arrasta a
sidebar junto no scroll.

| Área | Rota | Grupo de permissão | Observação relevante |
|---|---|---|---|
| Motor de CRUD genérico (~27 módulos "padrão", seção 6.7 do prompt do backend) | `/admin/modulos/[slug]` | por módulo (`registry.ts`) | rota dinâmica única, evita duplicar página por recurso |
| Gestão de usuários | `/admin/usuarios` | admin-only | soft-delete (desativar/reativar, não exclui de verdade); auto-proteção pra própria conta; bespoke paginado (sem `/filtro` dedicado). **`GET /api/admin/users` também é usado como sonda de detecção de papel** (ver `src/modules/auth/auth.service.ts` `detectarPapeisEId` — não existe endpoint `/me`, então o frontend testa se o usuário consegue listar usuários pra inferir `ROLE_ADMINISTRATOR`) — se esse endpoint mudar de contrato de novo, quebra a detecção de admin em todo o painel silenciosamente (ver "bug crítico" na seção 2.1 abaixo) |
| Auditoria | `/admin/auditoria` | admin-only | cobertura parcial: só módulos genéricos + gestão de usuários geram registro |
| Avisos | `/admin/institucional/avisos` | `institucional` | JSON puro, `InstitucionalCrudPage` genérico |
| Notícias | `/admin/institucional/noticias` | `institucional` | multipart (`dados`+`imagem` opcional), form próprio (não usa o genérico) |
| Fornecedores | `/admin/geral/fornecedores` | `geral` | bespoke paginado (`usePageableResource`), filtro via `GET .../filtro` (`nome`, `cnpj`); `GeralSimplesCrudPage.tsx` genérico foi removido (só Fornecedores usava, virou página própria) |
| Secretarias (Unidade + 5 sub-recursos) | `/admin/geral/unidades` + `/admin/geral/unidades/[id]` | `geral` | multipart na unidade; agora bespoke paginado (`GET` base já aceita `nome`/`vigencia` como query params direto, sem `/filtro` separado); detalhe com abas pros 5 sub-recursos; Documentos tipados são 3 slots fixos (Termo/EDTC/Declaração E-SIC), reenviar substitui; excluir a unidade dá `409` se tiver sub-recurso vinculado (sem cascade) — excluir os 5 primeiro |
| Tabela de Valores de Diária | `/admin/geral/tabela-valores` | `geral` | multipart; **o OpenAPI documenta esse endpoint como JSON por engano, é multipart de verdade** |
| E-SIC — Configuração | `/admin/esic/config` | `esic-ouvidoria` | singleton (upsert, 404 antes de configurado) |
| E-SIC — Formulários recebidos | `/admin/esic/formularios` | `esic-ouvidoria` | somente leitura; bespoke paginado, filtro via `GET .../filtro` (`tipoSolicitacao`, `nome`, `email`, `dataInicial`, `dataFinal`) — `GET .../tipo` foi removido pelo backend, não usar mais |
| Ouvidoria — Configuração | `/admin/ouvidoria/config` | `esic-ouvidoria` | singleton; **sem tela de formulários recebidos** — backend não expõe listagem pra esse recurso |
| Servidores, Cargos, Diárias | `/admin/rh/{servidores,cargos,diarias}` | `rh` | bespoke paginado (servidores/diárias) ou lista simples (cargos) |
| Folha de Pagamento | `/admin/rh/folha` | `rh` | **sem `PUT`/`DELETE`** — lançamento é definitivo. **Pendente**: aba "Por mês" (`folha.service.ts` `listarPorMes`) ainda lê o `GET` como array puro — backend paginou esse endpoint (`GET .../folha/por-mes?mes=&ano=`) e isso vai quebrar a aba; não corrigido ainda, ver seção 4 |
| Concursos | `/admin/rh/concursos` + `[id]` (anexos) | `padrao` (não `rh`!) | única exceção do grupo RH — segue a regra geral de MANAGER; bespoke paginado (admin + público), filtro via `GET .../filtro` (`numero`, `ano`, `descricao`, `dataAberturaInicial`, `dataAberturaFinal` — sem `status`); anexos por concurso continuam array simples (não paginado, é sub-listagem naturalmente pequena) |
| Convênios | `/admin/convenios` | `obras-repasses` | multipart (`dto`+`pdf`); bespoke paginado, filtro via `GET .../filtro` (`numero`, `convenente`, `dataAssinaturaInicial`, `dataAssinaturaFinal`) — não confundir com o módulo público de Convênios (Transferências/Acordos), que é outro recurso e já estava correto |
| Emendas Parlamentares | `/admin/emendas-parlamentares` | `obras-repasses` | JSON paginado, filtro por tipo OU ano (não combinável) |
| Obras Públicas | `/admin/obras` + `/admin/obras/[id]` (Medições/Anexos/ART) | `obras-repasses`, **exceto ART = `padrao`** | campos calculados da obra (`totalMedicao`, `saldoObra` etc.) dependem do módulo Licitações (contratos), ainda não implementado — ficam em 0/negativo até lá, não é bug. Bespoke paginado (admin + público), filtro via `GET .../filtro` (`numero`, `status`, `tipo`, `unidadeId`, `fornecedorId`, `paralisada`) — público migrou de "sem paginação"/filtro em memória pra filtro real no backend; Medições/Anexos/ART continuam array simples (sub-recurso pequeno, sem paginação) |
| Licitações (Licitação + Contratos + Aditivos) | `/admin/licitacoes` + `/admin/licitacoes/[id]` (Documentos/Contratos) + `/admin/licitacoes/contratos/[contratoId]` (Documento/Aditivos) | `licitacoes` | 3 níveis (licitação → contrato → aditivo/documento); editar/excluir Contrato na própria aba; Aditivo edita com reenvio opcional de PDF; RBAC combinada: editar é `MANAGER`, excluir é admin-only (`licitacoes` fora do `EDITAR_ADMIN_ONLY`, dentro do `EXCLUIR_ADMIN_ONLY` em `permissoes.ts`); status/tipo de procedimento vêm do backend como texto (não a chave do enum) — `enumMapping.ts` reverte pra popular `<select>` de edição e colorir o Badge. **Licitação não tem mais `DELETE`** (exigência do TCE, preserva sequência/histórico) — troca por `PATCH .../visibilidade` (ocultar/mostrar da consulta pública, admin-only, botão com ícone de olho); toda licitação tem `numeroSequencial` (nº oficial do TCE, mostrado em destaque na lista e no detalhe) e `visivel`; filtro `visivel` em `/buscar` é admin-only (403 pra MANAGER) — só aparece na UI pra quem é `ROLE_ADMINISTRATOR` (`FiltroLicitacaoAdmin`, separado do `FiltroLicitacao` público de propósito). `GET /licitacoes/contratos/aditivos` (listagem por contrato) também virou sempre paginado — como aditivos por contrato são poucos, o service só pede uma página grande (`size: 100`) e devolve `.content`, sem UI de paginação |
| Diário Oficial — Configuração | `/admin/diario-oficial/config` | `diario-oficial` | singleton multipart; **brasão e logo são partes obrigatórias sempre** — não tem como editar só texto sem reenviar as duas imagens (backend, não é bug do front) |
| Diário Oficial — Publicações | `/admin/diario-oficial/publicacoes` (fila paginada com filtro por status + criar) + `/admin/diario-oficial/publicacoes/[id]` (status + timeline de logs + aprovar/rejeitar/retomar) | `diario-oficial` | pipeline assíncrono real (validação → composição do documento oficial com cabeçalho/rodapé/QR code → aguarda aprovação humana → assinatura digital ICP-Brasil de verdade via DSS → publica → indexa no Meilisearch); página de detalhe faz polling a cada 3s enquanto o processamento automático está rodando; existe um job de reconciliação no backend que retoma sozinho solicitações travadas há +15min — já vimos ele falhar de verdade numa fixture por não conseguir alcançar o TSA externo (freetsa.org) a partir do ambiente local, não é bug do front |
| Anticorrupção (Empresas em Dívida Ativa + Empresas Inidôneas/Suspensas) | `/admin/anticorrupcao/empresas-divida-ativa` (CRUD completo) + `/admin/anticorrupcao/empresas-inidoneas` (CRUD completo) | `anticorrupcao` (admin-only edit/exclude) | bespoke paginado (`usePageableResource`, filtro via `GET .../filtro` com `nome`/`razaoSocial`/`cnpj` ou `empresa`/`cnpj`/`status` + `dataInicial`/`dataFinal`), multipart `dados`+`pdf` (pdf sempre opcional, nome da parte é `pdf`, não `arquivo`); aparece na sidebar mesclado na categoria "Fiscal e Orçamentário" (mesma UI da Renúncia Fiscal), mas o grupo de permissão é `anticorrupcao`, não `fiscal-orcamentario` — só a categoria visual é compartilhada |

Estagiários/Terceirizados e Fiscal de Contratos usam o motor de CRUD genérico (não têm entrada
própria na tabela acima). Todos os módulos bespoke planejados estão implementados — não há mais
nenhum item "em breve" na sidebar.

**Lacunas de backend já resolvidas** (commits `b498a64`, `95830a0`, `d986dbf`, `2520a21`,
`cfc007b`, `50663b4`, `26cf489`, `3d70b68` no repo do backend, 2026-07-20/21 — frontend já
atualizado e testado contra elas):
- `EmpresaDividaAtivaServiceImpl.atualizar` (`PUT /api/gestao-fiscal/empresas-divida-ativa/{id}`)
  apagava o PDF existente sempre que o `PUT` não vinha com arquivo novo — corrigido pra só mexer
  no arquivo dentro do `if (pdf != null && !pdf.isEmpty())`, mesmo padrão de
  `ConvenioServiceImpl.atualizar`. Confirmado via `curl` e pela UI (editar sem reenviar arquivo
  agora preserva o PDF atual).
- Licitação, Contrato e Aditivo ganharam `PUT` (`ROLE_MANAGER`, `DELETE` continua
  `ROLE_ADMINISTRATOR`); Contrato ganhou `DELETE` (cascateia documentos e aditivos).
- Aditivo: `POST`/`PUT` viraram multipart (`dados` + `arquivo` opcional) — upload de PDF real,
  `caminhoPdf` some do request e passa a ser preenchido pelo backend a partir do arquivo.
- Bug do `GET /api/licitacoes/{licitacaoId}/contratos/filter` (ignorava `licitacaoId`)
  corrigido — segue sem uso no frontend (usamos `/{licitacaoId}/contratos` direto).
- Path de Fiscal de Contratos: `/api/licitacao/...` → `/api/licitacoes/...` (plural, consistente
  com o resto do módulo) — `basePath` ajustado em `registry.ts`.
- `GET /api/edicoes/publicacoes` (listagem paginada, filtro por `status`) e
  `GET /api/edicoes/publicacoes/{id}/logs` (timeline de `LogEtapaProcessamento`) — desbloqueou a
  fila de aprovação e o histórico de etapas na tela de detalhe.
- `DELETE /api/licitacoes/{id}` removido (exigência do TCE) — substituído por
  `PATCH .../visibilidade`; `numeroSequencial` (TCE) e `visivel` novos no response;
  `visivel` filtrável em `/buscar`, admin-only. **Observação**: `DELETE` nesse path agora
  devolve `500` em vez de `404`/`405` — não afeta o frontend (não chamamos mais esse endpoint),
  mas vale o backend investigar se isso é intencional.
- `GET /api/gestao-fiscal/empresas-divida-ativa` e `GET /api/gestao-fiscal/empresas-inidoneas`
  passaram de array puro pra `Page<T>` (agora exigem `pageable`), sem aviso prévio — quebrou o
  módulo Anticorrupção logo depois de commitado (a página ficava só com o cabeçalho, sem tabela
  nem erro visível, porque `Page` não é array e `.length` de um objeto não é `0` nem `>0`).
  Também surgiu `GET .../filtro` nos dois recursos (`nome`/`razaoSocial`/`cnpj`/`dataInicial`/
  `dataFinal` na dívida ativa; `empresa`/`cnpj`/`status`/`dataInicial`/`dataFinal` nas inidôneas).
  Aproveitado pra migrar os dois de "sem paginação" pra "bespoke paginado" de vez, com filtro de
  verdade na UI — ver tabela de módulos acima.
- `EmpresaInidoneaSuspensaController`/`Service` ganharam `PUT /api/gestao-fiscal/empresas-inidoneas/{id}`
  (multipart `dados`+`pdf`, mesmo padrão condicional de PDF do `atualizar` de Dívida Ativa — só
  mexe no arquivo se `pdf` vier preenchido). Frontend ganhou o botão "Editar" nessa tela.
  Confirmado via leitura do controller/service e teste na UI (editar nome sem reenviar PDF
  preserva o "Ver PDF"; `PUT` retornou `200`).

**Lacuna de backend ainda pendente** (decisão consciente, adiada — não é bug):
- Fiscal de Contratos continua sem vínculo (FK) com Contrato/Licitação — é um cadastro de
  documento avulso genérico (`{descricao, data, caminhoArquivo}`), apesar do nome sugerir que
  seria ligado a um contrato específico. Só vira trabalho se virar requisito de produto.

## 2.1 Rodada de paginação em massa (2026-07-23) — em andamento

O backend rodou uma auditoria grande e adicionou paginação/filtro em ~12 módulos que antes
devolviam `List` inteira, além de mudanças pontuais em Licitações e Diário Oficial (changelog
completo recebido do agente do backend, resumido aqui). Cada `GET` afetado passou de array puro
(`[...]`) pra `Page<T>` (`{content, totalElements, totalPages, number, size, ...}`) — qualquer
tela que lia a resposta como array quebra (`.length`/`.map` num objeto não bate, geralmente sem
erro visível: a tela só fica sem tabela nem mensagem de vazio).

**Já corrigido e testado nesta sessão** (commits a seguir neste log): e-SIC Formulários,
Fornecedor, Unidade, Convênio (admin), Obra Pública (admin + público), Aditivo de Contrato
(admin + público), Concurso (admin + público), Usuários (admin) — ver observações de cada um na
tabela de módulos acima.

**Bug crítico encontrado e corrigido no meio do caminho**: `src/modules/auth/auth.service.ts`
(`detectarPapeisEId`) descobre se quem logou é admin chamando `usuariosService.listar()` e
testando se a chamada teve sucesso (só admin pode listar usuários) — e fazia `.find(...)` direto
no retorno esperando um array. Como `GET /api/admin/users` também virou `Page<T>`, `.find` falhava
(`Page` não tem `.find`), a exceção caía no `catch` e **todo login de admin era silenciosamente
rebaixado pra permissão de Gerente** (perdia botões de editar/excluir em qualquer grupo
admin-only, tela `/admin` mostrava "Gerente" pro usuário admin). Corrigido pra ler `pagina.content`
com `size: 500`. Se em algum teste futuro os botões de admin sumirem sem motivo aparente, checar
esse arquivo primeiro.

**Ainda pendente** (não corrigido, próxima sessão deve começar por aqui):
- **Folha de Pagamento — aba "Por mês"** (`src/modules/recursos-humanos/folha.service.ts`
  `listarPorMes`, consumida em `AbaPorMes` dentro de
  `src/app/admin/(painel)/rh/folha/page.tsx`): `GET .../folha/por-mes?mes=&ano=` também virou
  paginado, sem filtro novo (só ganhou paginação). Precisa desembrulhar `.content` — como
  `mes`/`ano` já são obrigatórios, não precisa de UI de paginação, só pedir `size` grande (padrão
  já usado: `{ size: 200 }`) igual foi feito com Aditivo de Contrato.
- **Relatório de Gestão Fiscal e Relatório de Execução Orçamentária**
  (`src/modules/gestao-fiscal/gestaoFiscal.service.ts`, consumidos via `useAsyncData` em
  `RelatoriosGestaoFiscalListView`/`RelatoriosExecucaoOrcamentariaListView`): só existe consumo
  público (não achei CRUD admin pra esses dois — pode já existir em outro lugar não localizado,
  ou ainda não foi implementado). Confirmar com `curl` se o backend realmente pagina esses dois
  GETs antes de mexer (não confirmado ainda nesta sessão) e, se sim, portar pro padrão
  `usePageableResource` como os outros públicos (`useObras`, `useConcursos`).
- **Diário Oficial — dois endpoints novos, sem breaking change, só feature faltando**:
  - `DELETE /api/edicoes/publicacoes/{id}` (admin-only) — remove uma solicitação da fila; só
    aceita se status for `FALHOU` ou `PUBLICADO` (bloqueia se estiver em processamento ativo ou
    aguardando aprovação). Adicionar botão "Excluir" na tela de detalhe
    (`/admin/diario-oficial/publicacoes/[id]`), condicionado a esses dois status.
  - `DELETE /api/edicoes/{numero}` (admin-only) — apaga edição já publicada (registro + PDF +
    índice no Meilisearch). Adicionar em algum ponto da tela de publicações (a decidir onde faz
    mais sentido na UI — não existe tela de "edições publicadas" separada hoje, só a fila).

**Confirmado que NÃO precisa de ação**: `GET /api/licitacoes` (bare, sem filtro) foi removido pelo
backend, mas nenhum arquivo do frontend chamava esse path — tanto o service público quanto o
admin já usavam `GET /licitacoes/buscar` (`Page<LicitacaoResumo>` + `usePageableResource`) desde
antes desta rodada.

Ver também a pegadinha de sandbox sobre páginas públicas com `<Suspense>` travando na ferramenta
de preview (seção 4) — isso limitou a verificação visual do lado público de Obras/Concursos nesta
sessão; a correção foi validada por leitura de código + `tsc`/`eslint` limpos + teste do lado
admin (mesmo hook, mesmo padrão de service).

## 3. Como decidir o padrão de um módulo novo

```bash
curl -s http://localhost:8080/v3/api-docs | python3 -m json.tool   # spec atualizado
```

Formatos de DTO em uso, decida qual é **antes** de codar:

- **Documento genérico** — `{id, descricao, data, caminhoArquivo}` via
  `GET /{basePath}/{recurso}/filtro` + `GenericDocumentoFiltroDto`. Reaproveita
  `src/modules/shared/services/documentoGenerico.service.ts`
  (`criarServicoDocumentoGenerico`) — mais rápido, ~4 arquivos pequenos + rota.
- **Bespoke paginado** — DTO próprio, mas pagina/filtra no backend. `usePageableResource<T, F>`
  direto. Precedentes: `servidor`, `diarias`, sub-recursos de `convenios`.
- **Bespoke sem paginação** — `GET` retorna array completo. `useAsyncData` + `AsyncList`.
  Precedentes: `gestao-fiscal`, `obras`, `secretarias`.
- **Info singleton** — `GET` retorna um objeto único, não lista. `useAsyncData` com
  `valorInicial: null`. Precedentes: `esic`, `ouvidoria`.
- **PDF estático, sem backend** — `src/components/ui/PdfViewer.tsx` direto no `page.tsx`, com
  o caminho marcado `// TODO`. Precedentes: `estrutura-organizacional`, `organograma`.
- **Multipart com sub-recursos filhos** (ex: Unidade/Secretarias, Obras) — página de detalhe
  `[id]/page.tsx` com abas por sub-recurso; cada sub-recurso normalmente só tem criar+listar+
  excluir (sem editar — exclui e recria); confirme os paths de exclusão direto no controller do
  backend, não confie só na descrição em prosa de quem passou o contrato (bespoke desse tipo já
  teve path errado documentado mais de uma vez).

Outras convenções:
- Rota do frontend espelha o basePath do backend 1:1.
- Estado compartilhável (aba ativa, filtros, página) sempre na URL via `useUrlState` /
  `usePageableResource`, nunca em `useState` puro.
- Tipo canônico de um recurso que existe tanto no site público quanto no admin mora no módulo
  público (`src/modules/<recurso>/types.ts`), e o admin reexporta de lá + define só os
  `*Request` — precedentes: `ObraPublica`, `Unidade`.
- Antes de assumir que um contrato multipart está certo, teste os campos opcionais (arquivo
  ausente, PDF ausente) via `curl` direto — pelo menos 3 módulos diferentes já tiveram bug real
  de backend especificamente no caminho "sem arquivo".
- **Enum vindo do backend pode ser a chave (`"EM_ANDAMENTO"`) ou a descrição textual (`"Em
  andamento"`/`"EM ANDAMENTO"`)** dependendo se a entidade Java tem `getDescricao()` custom ou
  deixa o Jackson serializar o enum puro — não dá pra assumir, sempre teste via `curl` antes de
  montar o `<select>` de edição. Quando é descrição, `<select value={form.campo}>` só casa a
  opção certa se você reverter a descrição de volta pra chave antes de popular o form (senão o
  form abre em branco/errado mesmo com o dado certo por baixo). Precedente resolvido em
  `src/modules/admin/licitacoes/enumMapping.ts` (`normalizarStatus`/`normalizarTipoProcedimento`)
  — mesma ideia serve pra qualquer módulo novo que caia nesse caso.
- Cuidado com comparação de tipo em filtro que vem da URL: `usePageableResource` guarda todo
  filtro como **string** (lido de `URLSearchParams`), mesmo que o tipo declarado em `FiltroX`
  seja `boolean`/`number`. Comparar direto com `=== false`/`=== 0` nunca bate (é sempre a string
  `"false"`/`"0"`) — já causou um bug real (filtro de visibilidade de Licitação travava em
  "ocultas", só saía com reload). Compare com `String(filtros.campo) === 'false'` ou similar.

## 4. Como retomar (rodar o ambiente)

**Prefira o perfil `postgres`, não `dev`** — banco real (Postgres via Docker), dados persistem
entre restarts, já vem populado com fixtures.

```bash
npm run dev                                                                          # frontend :3000

cd ~/Documentos/ProjetoPref/portal-transparencia-pref
docker compose up -d postgres meilisearch                                           # precisa docker
./mvnw spring-boot:run -Dspring-boot.run.profiles=postgres -DskipTests -Dmaven.test.skip=true  # backend :8080

curl -s http://localhost:8080/v3/api-docs                                           # confirma o backend e pega o spec atualizado
```

Perfil `dev` (H2 em memória, reseta a cada restart) serve pra testar algo isolado sem depender
de fixture — troque `postgres` por `dev` e pule o `docker compose up`.

Login: `admin@prefeitura.dev` / `admin123` (bootstrap automático no primeiro start, nos dois
perfis).

Playwright está disponível no ambiente (`node_modules/.bin/playwright`) — rodar um script de
teste precisa de `NODE_PATH=<repo>/node_modules node script.js` se o script morar fora do
projeto (ex: no scratchpad da sessão), senão a resolução de módulo não encontra o pacote.

### Pegadinhas específicas deste sandbox (2026-07)

- **Node.js não está no PATH por padrão** neste ambiente (é gerenciado via nvm, mas o shell não
  sourced o nvm automaticamente pra sessões de ferramenta/ci). Antes de rodar `npm`/`npx`,
  confirme com `ls ~/.nvm/versions/node/` e prefixe: `export
  PATH="$HOME/.nvm/versions/node/<versão>/bin:$PATH"`. Pra rodar o dev server via ferramenta de
  preview (que não herda esse `export`), já existe um workaround em `.claude/` (não commitado de
  propósito, é específico da máquina):
  - `.claude/launch.json` aponta `runtimeExecutable` pra `.claude/dev-with-node.sh`.
  - `.claude/dev-with-node.sh` só exporta o PATH certo e faz `exec npm run dev`.
  Se `node_modules` não existir ainda, rode `npm install` primeiro (uma vez).
- **`/opt/portal` (raiz de upload padrão do backend, perfis `postgres`/`dev`) não é gravável**
  pelo usuário `pc` neste sandbox (é do `root`). Sem sudo disponível, suba o backend com um
  override pra um diretório que você tenha permissão de escrita, ex:
  `-Dspring-boot.run.arguments="--app.root.dir=$HOME/portal-uploads-dev"` (crie a pasta antes).
- O backend roda com **`spring-boot-devtools`** — reinicia sozinho quando detecta classe
  recompilada. Durante testes manuais isso pode causar um `ECONNREFUSED` de alguns segundos no
  meio de uma sequência de requests; não é bug do frontend nem do seu teste, só espere e repita.
- Há um **job de reconciliação** no pipeline do Diário Oficial que retoma sozinho solicitações
  travadas há mais de ~15min — pode mexer em dados de teste/fixture sem você ter feito nada (já
  vimos isso mudar o status de uma licitação de teste no meio de uma sessão). Não é bug seu, mas
  pode confundir se você não souber que existe.
- **Páginas públicas que usam `<Suspense>` envolvendo um client component com
  `usePageableResource`/`useAsyncData`** (ex.: `/obras`, `/licitacoes`, `/avisos`) **travam pra
  sempre no fallback do Suspense** quando abertas pela ferramenta de preview (Claude Browser) —
  confirmado em 3 rotas diferentes, inclusive páginas nunca tocadas na sessão, com bundle correto
  (`NEXT_PUBLIC_USE_MOCK` compilado certo, código do serviço/mock presente) e zero erro no
  console/servidor mesmo depois de reiniciar o dev server e esperar 10s+. Páginas públicas sem
  esse padrão (ex.: `/transparencia`) carregam normal. É uma limitação da ferramenta de preview
  neste sandbox, não um bug do app — telas **admin** equivalentes (que são `'use client'` direto
  na página, sem `<Suspense>`) funcionam normalmente na mesma ferramenta. Pra validar mudança em
  view pública com esse padrão, confie na leitura do código + `tsc`/`eslint` limpos e na
  verificação do lado admin (mesmo hook, mesmo service) em vez de insistir no preview.

### Testando no navegador via ferramenta de preview (Claude Browser)

- `computer{action:"left_click", ref:...}` às vezes simplesmente não dispara o evento de clique
  em alguns botões (nenhum erro, só nenhuma request nova aparece em `read_network_requests`) —
  não é bug do app. Workaround confiável: `javascript_tool` com
  `document.querySelectorAll('button')` filtrando pelo texto e chamando `.click()` direto no
  elemento. Depois de um clique via JS, dê uma folga (`computer{action:"wait"}`, não `sleep` do
  Bash) antes de reler a página — o ciclo request→setState→render às vezes demora mais que o
  esperado num ambiente com HMR ativo.
- `computer{action:"screenshot"}` consistentemente dá timeout neste ambiente — não é confiável
  pra verificação visual. Prefira `get_page_text`, `read_page` (árvore de acessibilidade) e
  `javascript_tool` (ex.: `getBoundingClientRect()`, `scrollTop`, `innerText`) pra confirmar
  comportamento — inclusive dá pra provar coisas como "a sidebar não rola junto" de forma mais
  precisa que uma screenshot.
- Diálogos nativos de `confirm()` (usados antes de excluir/ocultar) **travam a automação** — o
  clique no botão que dispara o `confirm()` nunca retorna. Pra testar esses fluxos, ou aceite
  que não dá pra automatizar esse clique específico (valide só que o handler dispara a request
  certa via outro caminho), ou limpe/reverta o dado de teste direto no backend depois.
- Sem `DELETE` em vários recursos agora (Licitação por exigência do TCE; Diário Oficial nunca
  teve), dado de teste criado durante verificação manual só sai do banco via SQL direto:
  `docker exec portal-prefeitura-postgres psql -U portal -d portal_prefeitura -c "DELETE FROM
  <tabela> WHERE id IN (...)"`. Sempre confirme via `curl` antes/depois de mexer direto no banco,
  e cuidado pra não apagar fixture de verdade (numeração baixa, tipicamente 1-4) — só limpar o
  que você mesmo criou na sessão.
