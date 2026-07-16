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
| Tabela com Padrão Remuneratório | `/cargos` | bespoke, sem paginação, renderizado como `<table>` | `GET /recursos-humanos/cargos` |

**Diário Oficial ganhou busca** (2026-07-14): `/edicoes/filtro` foi criado sob pedido nosso
(endpoint novo, `GET /edicoes` sem filtro continua existindo). Filtros: `tipo` (enum),
`numeroEdicao` (exato), `dataInicial`/`dataFinal` (intervalo de `dataPublicacao`), todos
combináveis via AND. `diario-oficial.service.ts` agora sempre chama `/edicoes/filtro` (filtro
vazio = mesmo resultado de `/edicoes`). Sem full-text search — o DTO não tem campo de texto.
Também ganhou um banner de "Última Edição Publicada" (`UltimaEdicaoDestaque.tsx`), com busca
própria (`useUltimaEdicao`) independente dos filtros da listagem.

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

1. **Transferências disciplinadas pela EC nº 105** — `GET /execucao-orcamentaria/transferencia-voluntaria/filtro`,
   formato documento genérico. **Confiança moderada no mapeamento**: o nome do endpoint
   ("Transferência Voluntária") é genérico, não menciona EC 105 explicitamente — confirmar
   com quem administra o backend antes de assumir que é o recurso certo.
2. **Ato de adesão** — não é endpoint novo: dá pra reaproveitar `/licitacoes` filtrando
   `tipoProcedimentoLicitacao=AARP` (Adesão à Ata de Registro de Preços já é um valor do enum
   `TipoProcedimentoLicitacao`).
3. **Dispensas e inexigibilidade** — mesma ideia, mas os tipos `DP`/`DEL`/`IN` exigiriam filtro
   multi-valor em `FiltroLicitacao.tipoProcedimentoLicitacao`, que hoje só aceita 1 valor por vez.
4. **Detalhe de Obra Pública** — `/obras` já tem sub-recursos não usados no frontend: ARTs
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
  **Cuidado**: um processo com TTY `pts/N` (em vez de `?`) pode ser um servidor que o próprio
  usuário está rodando manualmente em outro terminal, não necessariamente sobra de teste — 
  confirme com o usuário antes de matar um processo em `pts/N` que você não iniciou nesta
  sessão. Processos que você mesmo sobe via `nohup ... & disown` aparecem com TTY `?`.

## 7. Dashboard administrativo — fase 1 implementada (2026-07-15)

Próxima frente grande do projeto: um dashboard pra funcionários da prefeitura fazerem CRUD
nos dados que hoje o portal só lê (o backend já expõe `POST`/`PUT`/`DELETE` pra quase todo
recurso — ver seção 4). **Decisão: mesmo app Next.js, não um projeto/deploy separado.**

Raciocínio (discutido em conversa, não é definitivo — revisitar se o contexto mudar):

- Cidade pequena, pouco tráfego, sem time de infra dedicado → dois deploys (dois processos,
  dois certificados, duas pipelines) é custo operacional puro, sem ganho de performance que
  vá ser sentido nessa escala.
- Bundle inflado pelo admin não é problema real: o Next.js já faz code-splitting por rota,
  então quem visita `/licitacoes` nunca baixa o JS do admin de qualquer forma.
- O medo inicial era "rota de admin esquecida sem proteção = exposta publicamente". Mas o
  backend usa Spring Security e barra `POST`/`PUT`/`DELETE` (e deveria barrar todo `GET`
  sensível) sem sessão válida — **a proteção real já está no backend**, não depende do
  frontend esconder a UI. Pior cenário de uma rota de admin sem gate no frontend: alguém vê
  a casca de um formulário e recebe 401/403 ao tentar qualquer ação. Não é vazamento de dado
  nem escrita indevida.
- Portanto separar em dois apps não compra proteção adicional nenhuma nesse caso — só custo.

**Plano quando for implementar:**
- Rotas em `src/app/admin/*` (route group), protegidas por um `middleware.ts` que barra o
  segmento inteiro por padrão (checa sessão antes de renderizar) — isso é por **UX** (não
  mostrar formulário/erro feio pra visitante aleatório, não expor estrutura interna do admin
  como reconhecimento), não é a barreira de segurança crítica.
- **Pendência resolvida**: `GET /api/**` é público em quase tudo, exceto `/api/admin/**`
  (sempre exige `ROLE_ADMINISTRATOR`, mesmo pra leitura). Confirmado contra o spec real e
  contra o contrato completo entregue pelo backend em
  `/home/rudinei/Documentos/prompt-frontend-dashboard-admin.md` (não versionado neste repo,
  fica no home do usuário — vale reconferir se ele existir numa sessão futura).

### 7.1 O que foi implementado nesta sessão

Fundação completa + motor de CRUD genérico + gestão de usuários, seguindo o prompt do backend
citado acima:

- **Auth** (`src/modules/auth/`): login via `POST /users/login` (fora do prefixo `/api` —
  `next.config.ts` ganhou um segundo rewrite só pra isso, e existe `src/services/authApi.ts`
  como instância irmã de `src/services/api.ts` com baseURL diferente). Token JWT salvo em
  cookie `admin_token` (não-httpOnly — só pro `middleware.ts` conseguir ler; a barreira real
  continua sendo o backend).
- **Descoberta importante sobre o JWT**: o token emitido só carrega `{iss, iat, exp, sub}` —
  **não tem claim de roles nem de id**, e não existe endpoint `/users/me`. Solução adotada:
  `detectarPapeisEId` (`src/modules/auth/auth.service.ts`) usa `GET /api/admin/users` como
  sonda — 200 = `ROLE_ADMINISTRATOR` (e a própria lista retornada revela o próprio `id`,
  casando pelo e-mail do token, usado pra desabilitar "alterar role"/"excluir" na própria
  linha em `/admin/usuarios`); 403 = `ROLE_MANAGER` (único outro papel que consegue logar).
- **RBAC** (`src/modules/auth/permissoes.ts`): `temPapel`/`isAdministrador` com hierarquia
  (`ROLE_ADMINISTRATOR` ⊇ `ROLE_MANAGER`). Módulos genéricos guardam o próprio
  `papelMinimoEdicao` direto na config (não um grupo genérico) porque a tabela da seção 6.7
  do prompt já diz manager/admin-only por módulo — mais confiável que re-derivar da tabela
  mais grosseira da seção 5 (ex: Renúncia Fiscal é "fiscal" mas fica em `ROLE_MANAGER` porque
  não está na lista nomeada da seção 5 pro grupo Fiscal/Orçamentário).
- **`middleware.ts`** (raiz do projeto): barra `/admin/*` sem cookie, exceto `/admin/login`.
- **`src/services/api.ts`**: interceptor de request anexa `Authorization: Bearer` do cookie;
  interceptor de response parseia o formato real de erro (`{errors: string[]}`, não
  `{message}` como estava antes) via `src/services/apiError.ts` (compartilhado com
  `authApi.ts`). Só força logout automático em 401 — um 403 é tratado como mensagem de
  permissão insuficiente, não sessão expirada (a própria sonda de papel depende de um 403
  "normal" aqui).
- **Layout do admin**: `src/app/admin/login/page.tsx` (sem shell) +
  `src/app/admin/(painel)/layout.tsx` (sidebar + topbar, `src/modules/admin/shared/AdminSidebar.tsx`).
  O layout raiz (`src/app/layout.tsx`) envolvia tudo em `PublicLayout` (header/footer do site
  público) — criei `src/layouts/RootLayoutSwitch.tsx` (client, checa `usePathname`) pra pular
  isso em `/admin/*` sem precisar duplicar `<html>/<body>` com route groups.
- **Motor de CRUD genérico** (`src/modules/admin/genericos/`): cobre os ~27 módulos do
  "padrão genérico" (seção 6.7 do prompt, 2 variantes: simples e com intervalo de data) via
  `criarServicoAdminDocumentoGenerico` + `GenericCrudPage.tsx` (lista com filtro/paginação
  reaproveitando `usePageableResource`, form de criar/editar com upload de PDF, excluir com
  confirm) + `registry.ts` (config de cada módulo) + rota dinâmica única
  `src/app/admin/(painel)/modulos/[slug]/page.tsx` (evita 27 arquivos de página quase
  idênticos — diferente do site público, que precisa de rota própria por SEO/breadcrumb;
  aqui é ferramenta interna).
- **Gestão de usuários** (`src/modules/admin/usuarios/`, `/admin/usuarios`, admin-only):
  criar/listar/alterar role/excluir, com auto-proteção (não pode alterar/excluir a própria
  conta — botão desabilitado com tooltip) e mensagens de erro 400/409 mostradas verbatim.

### 7.2 Bugs de backend encontrados na verificação — **corrigidos em 2026-07-15**

Dois bugs foram encontrados testando o painel admin contra o backend real e reportados pro
time do `portal-transparencia-pref`. Ambos corrigidos no commit `1db822a`
("fix(generic-crud): corrige 500 em GET após dados existirem e PUT exigindo arquivo") e
reverificados aqui contra o backend corrigido — ver seção 7.2.1.

**1. Leitura instável dos módulos do padrão genérico** (`GET {base}/filtro`, `GET {base}/{id}`
retornavam `500 {"errors":["No default constructor for entity 'X'"]}` de forma intermitente).
**Causa raiz real**: `@SuperBuilder` do Lombok sem `@NoArgsConstructor` nas subclasses de
entidade — não era corrupção de estado compartilhado como eu tinha hipotetizado a partir do
padrão observado (funcionava, depois parava de funcionar conforme mais módulos eram
exercitados). **Correção**: `@NoArgsConstructor` adicionado nas 26 entidades afetadas (as 25
do padrão genérico + `AnexoObraPublica`, achado extra que eu não tinha reportado).

**2. `PUT {base}/{id}` exigia a parte `arquivo`** mesmo o prompt do admin dizendo que é
opcional na edição (`500 "Required part 'arquivo' is not present"` quando omitida).
**Correção**: `PUT` agora aceita omitir `arquivo` (mantém o `caminhoArquivo` existente) e
continua substituindo corretamente quando um arquivo novo é enviado. O workaround que eu
tinha posto no frontend (exigir arquivo também na edição, em `GenericCrudPage.tsx`) foi
**revertido** — o form volta a tratar arquivo como opcional na edição, como o prompt sempre
disse.

#### 7.2.1 Reverificação pós-fix (2026-07-15)

Contra o backend com o fix aplicado (H2 em memória, reiniciado do zero):
- `POST` → `GET /{id}` logo em seguida → `GET /filtro?sort=data,desc`: todos `200` (antes,
  em uma sessão anterior, isso quebrava depois de alguns módulos serem exercitados).
- `PUT` sem a parte `arquivo`: `200`, mantém o `caminhoArquivo` anterior. `PUT` com arquivo
  novo: substitui corretamente. Ambos os caminhos testados via clique real na UI
  (`/admin/modulos/estagiarios`: criar → editar sem reenviar PDF → excluir, ciclo completo
  refletido na tabela).
- Módulo `lei` (que antes do fix tinha ficado com leitura quebrada numa sessão anterior)
  carrega normalmente agora.

Reconfirmado depois, já contra o **perfil `postgres`** (dados fictícios persistentes, ver
seção 8): módulo `estagiarios` já tinha um registro fictício real na listagem
("Estágio - Curso de Administração") — criei um segundo registro de teste ao lado dele,
editei sem reenviar arquivo, e excluí só o de teste, tudo via clique real na UI. O registro
fictício original permaneceu intacto na tabela depois. `renuncia-fiscal` e `lei` (os dois que
falhavam desde a primeira tentativa antes do fix) responderam `200` normalmente contra o
Postgres também.

Também vale registrar: o backend (`portal-transparencia-pref`) não sobe com `./mvnw
spring-boot:run` direto — os testes têm erros de compilação pré-existentes (`FiscalContratos`,
`ServidorServiceImplTest`, assinaturas desatualizadas, não relacionado aos bugs acima).
Precisa `-DskipTests -Dmaven.test.skip=true` pra só rodar a aplicação sem compilar os testes.

### 7.3 Desativação de usuário (soft delete) e auditoria (2026-07-15)

Duas features novas no backend, implementadas no frontend nesta sessão:

- **`DELETE /api/admin/users/{id}` agora desativa em vez de excluir** (mesmo contrato,
  `204`/`200`). Usuário desativado não consegue mais logar (`POST /users/login` retorna
  `401 {"errors":["Usuário desabilitado"]}`) e um token que ele já tivesse também para de
  funcionar na próxima requisição (confirmado: `GET /users/test` com token antigo passou a
  dar `403` depois da desativação).
- **`PATCH /api/admin/users/{id}/reativar`** (admin-only, sem body) reativa mantendo a role
  que já tinha, devolve `UserResponseDto`.
- **`UserResponseDto` ganhou `ativo: boolean`.** Refletido em `/admin/usuarios`
  (`src/app/admin/(painel)/usuarios/page.tsx`): coluna de status (badge Ativo/Inativo) e o
  botão da linha vira "Reativar" quando `ativo === false` (antes era só "Excluir"). Renomeei
  `usuariosService.excluir` pra `desativar` e adicionei `reativar` em
  `src/modules/admin/usuarios/usuarios.service.ts` pra refletir o que a chamada realmente faz.
- **Tela de auditoria nova** (`src/modules/admin/auditoria/`, rota `/admin/auditoria`,
  admin-only): lista `GET /api/admin/auditoria` com filtro por usuário/módulo/intervalo de
  data-hora + paginação (reaproveita `usePageableResource`, mesmo padrão dos módulos
  genéricos). **Cobertura parcial**: só os módulos do padrão genérico (seção 6.7) e a gestão
  de usuários geram registro — licitações, obras, RH específico, diário oficial etc. ainda
  não. Isso está avisado na própria tela (não construí um filtro de módulo em dropdown que
  desse a entender cobertura total — é um campo de texto livre).
- **Limitação conhecida, não resolvida**: se um usuário for desativado *enquanto* está com
  sessão ativa no navegador, as chamadas dele passam a devolver `403` (não `401`) — e o
  interceptor de `api.ts` só força logout automático em `401` (decisão deliberada: um `403`
  normalmente é só "essa ação específica não é permitida pro seu papel", não "sua sessão
  morreu", e tratar todo `403` como sessão inválida faria um `ROLE_MANAGER` ser deslogado só
  por tentar uma ação admin-only). Resultado prático: o usuário desativado no meio da sessão
  só percebe que algo está errado porque tudo passa a falhar, sem uma mensagem clara — não
  constrói detecção especial pra esse caso agora (cenário raro, sem risco de segurança real,
  já que o backend já bloqueia tudo mesmo sem o frontend perceber).

### 7.4 Institucional e Geral: Avisos, Notícias, Fornecedores, Unidades, Tabela de Valores (2026-07-16)

Seção 6.9 do prompt do admin ("manager pode tudo"), 5 recursos JSON simples — nenhum tem
restrição admin-only pra editar/excluir, diferente da maioria dos módulos anteriores:

- **Avisos e Notícias** (`src/modules/admin/institucional/`, rotas
  `/admin/institucional/{avisos,noticias}`): JSON puro (`{titulo, texto, data, ativo}`),
  paginado, filtro só por `ativo` (backend não tem busca por texto — não adicionei um campo de
  busca client-side pra não violar o padrão de filtro-no-backend). Reaproveita o tipo
  `ConteudoInstitucional` que já existia em `src/modules/institucional/types.ts` (site
  público) — mesmo formato de request/response, só que o público só faz `GET`. Componente
  único `InstitucionalCrudPage.tsx` parametrizado por serviço, usado pelas duas rotas.
- **Fornecedores e Unidades** (`src/modules/admin/geral/`, rotas
  `/admin/geral/{fornecedores,unidades}`): JSON puro, **sem paginação nem filtro no backend**
  (`GET` devolve array direto) — mesmo padrão bespoke de `/admin/usuarios`. Componente único
  `GeralSimplesCrudPage.tsx` genérico por lista de campos (`nome`+`cnpj` pra fornecedor, só
  `nome` pra unidade). **Desatualizado em 2026-07-16**: Unidades saiu desse padrão (virou
  multipart com campos novos) — ver seção 7.8. `GeralSimplesCrudPage` agora só serve
  Fornecedores.
- **Tabela de Valores de Diária** (`/admin/geral/tabela-valores`): multipart (`dados`+
  `arquivo`, igual ao padrão genérico), paginado, filtro por `descricao`/`tipoViagem`
  (`NACIONAL`/`INTERNACIONAL`)/intervalo de data via `GET /tabela-valores/buscar`.
  **Achado no spec**: o OpenAPI documenta o `POST`/`PUT` desse endpoint como
  `application/json` em vez de `multipart/form-data` (mesma assinatura suspeita do bug real de
  upload de documento de contrato de licitação, seção 6.2) — testei direto via `curl` antes de
  confiar (`POST`/`PUT` com/sem arquivo/`GET /buscar`, tudo `200`) e é só anotação errada do
  springdoc pra esse controller específico, o endpoint funciona normal como multipart de
  verdade. Documentado no código (`tabela-valores.service.ts`) pra não gerar dúvida de novo.
- Novo grupo `GrupoModulo = 'geral'` em `permissoes.ts` (cobre fornecedores/unidades/tabela de
  valores) — e finalmente usei os helpers `podeCriar`/`podeEditar`/`podeExcluir` que já
  existiam ali desde a sessão 1 mas nunca tinham sido chamados em lugar nenhum (os módulos do
  padrão genérico usam `temPapel` direto com `papelMinimoEdicao` da própria config).
- Testado via clique real na UI (não só leitura): criar → editar → excluir, ciclo completo,
  nos 4 tipos de tela (Avisos representando o padrão paginado JSON, Fornecedores/Unidades o
  não-paginado, Tabela de Valores o multipart com upload de PDF real) — sem erro de console em
  nenhum. Sidebar ganhou grupo "Institucional e Geral" com os 5 links, removido da lista "Em
  breve".

### 7.5 Próximos passos (módulos bespoke, não implementados ainda)

Nesta ordem sugerida (do mais isolado/simples pro mais complexo):
1. ~~**ESIC e Ouvidoria**~~ — feito em 2026-07-16, ver seção 7.6.
2. ~~**RH bespoke**~~ — feito em 2026-07-16, ver seção 7.7.
3. ~~**Convênios e Emendas Parlamentares**~~ — feito em 2026-07-16, ver seção 7.9 (Convênios
   com edição/exclusão bloqueadas por bug real no backend, reportado).
4. ~~**Obras Públicas e Repasses**~~ (obra + medições + anexos + ART, ART não é admin-only)
   — feito em 2026-07-16, ver seção 7.10.
5. **Licitações** (licitação + contratos + aditivos + fiscal-contratos; o upload de documento
   de contrato também foi **corrigido no backend em 2026-07-16**, ver seção 7.6 — deixou de
   ser bloqueio).
6. **Diário Oficial** — o mais complexo: fluxo de publicação com aprovação humana e assinatura
   digital (stepper de status `RECEBIDO → ... → PUBLICADO`, com `FALHOU`/retomar).

### 7.6 ESIC e Ouvidoria (2026-07-16)

Módulo admin novo, `src/modules/admin/esic-ouvidoria/`, 3 rotas:

- **`/admin/esic/config`** (`GET`/`PUT /esic/infos`) — form singleton com select de unidade
  responsável (reaproveita `unidadesService` de `admin/geral`). **Achado**: `GET /esic/infos`
  também devolve `404` antes da primeira configuração, igual `/ouvidoria/info` — não assumir
  que só o endpoint de ouvidoria faz upsert/404. Tratado como "ainda não configurado" nos dois.
  **Achado 2**: o backend devolve `LocalTime` como `"HH:mm:ss"`; os campos são truncados pra
  `"HH:mm"` ao popular o form (`<input type="time">` espera esse formato sem segundos).
- **`/admin/esic/formularios`** (`GET /esic/formulario`, filtro por tipo via
  `GET /esic/formulario/tipo?tipo=`) — somente leitura, array não paginado. Não há
  criar/editar/excluir no admin pra esse recurso (o `POST` é o formulário público do cidadão).
- **`/admin/ouvidoria/config`** (`GET`/`PUT /ouvidoria/info`) — mesmo padrão de config
  singleton. **Sem tela de formulários recebidos**: o controller de ouvidoria não tem
  `GET`/listar nem `DELETE`, só `POST` público (confirmado no spec e no
  `prompt-frontend-dashboard-admin.md`, seção 6.8) — não há o que construir aí ainda.
  **Achado 3**: `InfosOuvidoriaResponseDto` devolve `unidadeNome`, não `unidadeId` — o form de
  edição casa pelo nome contra a lista de unidades pra pré-selecionar o `<select>`; se o nome
  não bater (unidade renomeada/excluída), fica em branco e o admin escolhe de novo ao salvar.
- Grupo `esic-ouvidoria` em `permissoes.ts` já existia desde a sessão da fundação do admin
  (`podeEditar` = `ROLE_MANAGER`, `podeExcluir` = admin-only) — só reaproveitado, nenhum botão
  de excluir construído (nenhum dos dois controllers tem `DELETE` implementado ainda).
- Testado via Playwright headless (`channel: 'chrome'`, usando o Google Chrome já instalado no
  ambiente — `npm install --no-save playwright` funciona sem baixar browser) contra o backend
  real, perfil `postgres`: login, as 3 páginas carregando dados reais, salvar config do E-SIC
  (persistindo e recarregando), criar a config da Ouvidoria do zero (fluxo "ainda não
  configurado" → preencher → salvar → recarregar e confirmar persistência), e o filtro por
  tipo em formulários recebidos. Sem erro de console além dos 404 esperados (e duplicados pelo
  double-invoke do React StrictMode em dev) das checagens de "config ainda não existe".

### 7.7 RH bespoke: Servidores, Cargos, Diárias, Folha de Pagamento, Concursos (2026-07-16)

Módulo `src/modules/admin/rh/`, um `.service.ts` por recurso, 5 rotas (Estagiários/Terceirizados
já existiam via padrão genérico, não fazem parte desta leva):

- **`/admin/rh/servidores`** (bespoke paginado, `GET {base}/buscar`) — filtro por
  cpf/nome/cargo/unidade/intervalo de admissão. **Achado**: `POST`/`PUT` de `ServidorDto`
  aceitam `unidade: {id}` sozinho (sem `nome`) e o backend resolve a FK — confirmado via curl
  antes de fixar o formato no `ServidorRequest`.
- **`/admin/rh/cargos`** (JSON não-paginado, mesmo padrão de `GeralSimplesCrudPage` mas com
  campos numéricos) — `valorLiquido`/`media` são calculados pelo backend, só exibidos.
- **`/admin/rh/diarias`** (bespoke paginado, `GET /diarias/buscar`).
- **`/admin/rh/folha`** (`src/app/admin/(painel)/rh/folha/page.tsx`) — **sem `PUT`/`DELETE`
  no backend**, cada lançamento é definitivo. Duas abas (`?categoria=servidor|mes` via
  `useUrlState`): "Por servidor" (escolhe um servidor num `<select>` alimentado por
  `servidorService.listar({size:200})`, lista as folhas já lançadas e permite lançar uma nova —
  `salarioLiquido` é calculado no frontend como `bruto - desconto` e enviado já pronto, já que o
  DTO de request inclui esse campo explicitamente); "Por mês" (somente leitura, todos os
  servidores daquele mês/ano).
- **`/admin/rh/concursos`** (JSON não-paginado) **+ `/admin/rh/concursos/[id]`** (anexos) —
  **grupo de permissão `'padrao'`, não `'rh'`**: diferente de servidor/cargos/diárias/folha
  (admin-only pra editar/excluir), Concursos segue a regra geral de `ROLE_MANAGER` (mesma
  linha da tabela de permissões do prompt que agrupa Concursos com ART/Renúncia Fiscal/RGA/
  Plano Estratégico/institucional). O upload de anexo (`POST {base}/{concursoId}/anexos`,
  multipart `dados`+`arquivo`) é o mesmo endpoint que tínhamos corrigido antes (bug de
  `@PostMapping(name=...)` em vez de `value=...`) — confirmado funcionando de novo aqui.
- Testado via Playwright headless contra o backend real (perfil `postgres`): criar/editar/
  excluir um servidor de teste, listar cargos/diárias já existentes, lançar e visualizar folha
  (ficou um registro de teste real — servidor "Maria da Silva Souza", maio/2026 — sem como
  remover, não há `DELETE` de folha), criar um concurso de teste, subir um anexo PDF real,
  excluir o anexo e depois o concurso (limpeza completa, sem `DELETE` pendente aí). Zero erro
  de console.
- Sidebar: os 5 links novos foram mesclados dentro do cabeçalho "Recursos Humanos" que já
  existia pro Terceirizados/Estagiários (evita duplicar o título da seção) — ver
  `LINKS_RH_BESPOKE` em `AdminSidebar.tsx`.

### 7.8 Fix de breaking change: `/api/geral/unidades` virou multipart (2026-07-16)

O time do backend avisou (via `prompt-frontend-dashboard-admin.md`, canal já estabelecido)
que `Unidade` virou a base de um futuro módulo público "Secretarias" e o contrato mudou:
`POST`/`PUT` passaram a exigir `multipart/form-data` (parte `dados` JSON + parte `foto`
opcional, igual ao padrão de `tabela-valores.service.ts`) e `UnidadeResponseDto` ganhou
`cnpj, telefone, email, horarioAtendimento, endereco, atribuicoes, gestorNome, gestorCargo,
gestorVerificado, gestorFotoCaminho`. O aviso já veio com os 4 arquivos exatos afetados no
frontend, todos corrigidos:

- **`geral.service.ts`**: `unidadesService` saiu de `criarServicoAdminSimples` (fábrica JSON
  genérica) e ganhou implementação própria com `FormData`/`Blob` — `criarServicoAdminSimples`
  continua intacta, ainda serve `fornecedoresService`. `listar()` ganhou parâmetro opcional
  `nome` (novo filtro de busca livre do backend).
- **`geral/types.ts`**: `Unidade`/`UnidadeRequest` ganharam os campos novos.
- **`/admin/geral/unidades/page.tsx`**: reescrita do zero, saiu do `GeralSimplesCrudPage`
  (não suporta upload nem boolean) — form próprio com todos os campos, checkbox de
  `gestorVerificado`, input de foto (opcional na edição, mantém a atual se vazio) e busca por
  nome.
- **`rh/types.ts`**: o `Unidade` duplicado virou `import { Unidade } from
  '@/modules/admin/geral/types'`, com `Servidor.unidade` tipado como `Pick<Unidade, 'id' |
  'nome'>` — o `GET /recursos-humanos/servidor` só devolve esse subconjunto mesmo, então
  importar o tipo completo sem o `Pick` seria impreciso (sugeriria campos que não vêm nessa
  resposta).
- `src/app/admin/(painel)/rh/servidores/page.tsx`, `esic/config`, `ouvidoria/config` não
  precisaram de mudança — só chamam `unidadesService.listar()` sem filtro e leem `id`/`nome`,
  que continuam presentes.
- Testado via Playwright contra o backend real (perfil `postgres`, os 2 registros de Unidade
  antigos com campos novos `null`): listar com dados antigos, criar unidade nova com foto
  (imagem real), editar sem reenviar foto (mantém a atual), busca por nome, excluir, e
  reconfirmado que os 3 dropdowns dependentes (Servidores, E-SIC config, Ouvidoria config)
  continuam populando normalmente. Zero erro de console.

### 7.9 Convênios e Emendas Parlamentares (2026-07-16)

As 3 sub-recursos de Convênios (Acordo Firmado, Transferência Realizada/Recebida) já
existiam via padrão genérico desde a sessão 1. O que faltava era o recurso **base**
`/api/convenios` (não aparece no site público, só o admin) e **Emendas Parlamentares**:

- **`/admin/convenios`** (`src/modules/admin/convenios/`) — multipart com nomes de parte
  diferentes do padrão (`dto`+`pdf`, não `dados`+`arquivo` — confirmado no controller real).
  **Só Create + List estão ligados na UI.** Motivo: ver bug abaixo.
- **`/admin/emendas-parlamentares`** (`src/modules/admin/emendas-parlamentares/`) — CRUD
  completo, JSON paginado. Filtro por tipo OU ano (endpoints separados
  `/emendas-parlamentares/tipo/{tipo}` e `/ano/{ano}`, sem combinação — mesma regra e mesmo
  padrão de UI do módulo público, reaproveitando os enums `TipoEmenda`/`FormaRepasseEmenda`
  de `src/modules/emendas-parlamentares/enums.ts` em vez de duplicar).
- Grupo de permissão: `'obras-repasses'` pros dois (admin-only editar/excluir) — não um grupo
  novo, porque o próprio prompt do admin agrupa "Convênios e repasses" dentro da seção 6.5
  (Obras Públicas e Repasses), e o `SecurityConfiguration.java` do backend confirma:
  `/api/convenios/**` e `/api/emendas-parlamentares/**` estão na mesma lista
  `ENDPOINTS_EDICAO_RESTRITA` que `/api/obras/**`.

**Bug real, root cause confirmado em 2026-07-16 lendo o código-fonte do backend** (a
hipótese original de "problema de RBAC/RoleHierarchy" estava errada — descartada depois de
confirmar que a conta de teste é `ROLE_ADMINISTRATOR` de verdade via `GET /api/admin/users` e
reproduzir o mesmo 403 num `PUT` bem-sucedido minutos antes): **não é bug de permissão, é um
`NullPointerException` não tratado em `FileStorageServiceImpl.deleteFile()`**.
`ConvenioServiceImpl.deletar()` chama `fileStorageService.deleteFile(entity.getCaminhoPdf())`
incondicionalmente, e `atualizar()` faz o mesmo sempre que um novo PDF é enviado (pra apagar o
PDF antigo antes de salvar o novo) — mas `caminhoPdf` é opcional na criação (`POST
/api/convenios` aceita `pdf` ausente) e `deleteFile()` faz `Paths.get(filePath)` sem checar
null, o que lança `NullPointerException` na hora. Confirmado com reprodução controlada: `PUT`
sem trocar o PDF funciona (`200`) porque não entra no bloco que chama `deleteFile`; `PUT`
enviando um PDF novo pra um convênio com `caminhoPdf: null` reproduz o mesmo 403; criei um
convênio de teste **com** PDF e o `DELETE` nele funcionou normal (`204`) — confirmando que o
problema é especificamente a ausência de PDF, não o método HTTP nem a role. Tem ainda um
**segundo bug** no tratamento de erro que mascara o primeiro: o catch-all
`GlobalExceptionHandler.handleInternalServerError` tenta `buildResponse(500,
ex.getMessage())`, mas a `NullPointerException` do JDK aqui tem `getMessage() == null`, e
`buildResponse` faz `List.of(message)` — que rejeita elemento `null` — lançando uma *segunda*
NPE dentro do próprio exception handler. O Spring desiste de resolver a exceção original, ela
sobe sem tratamento pela cadeia de filtros do Spring Security, e o cliente recebe o 403 vazio
característico de segurança em vez de um 500 com corpo JSON explicando o erro real — daí o
sintoma enganoso de "parece permissão". Stack trace completo capturado no log do backend
durante a reprodução, disponível se for útil pra quem for corrigir. Fix sugerido: (1) guard
`if (entity.getCaminhoPdf() != null) fileStorageService.deleteFile(...)` nos dois lugares de
`ConvenioServiceImpl`, e (2) `buildResponse` não deveria quebrar quando a mensagem da exceção
é `null` (fallback pra uma string genérica). **Efeito colateral**: os 2 convênios de teste
(`Teste Convenente` nº 9001 id=2, `Teste2` nº 9002 id=3) continuam sem poder ser excluídos
via API — ambos têm `caminhoPdf: null`, então caem direto na NPE — ficam pro backend limpar
direto no banco, ou remover assim que o guard de null for adicionado.
- `atualizar`/`excluir` do `convenioService` estão implementados certos pro contrato (não é
  código quebrado, só não usado ainda) — quando o backend corrigir, é só adicionar os botões
  de editar/excluir na página, mesmo padrão das outras telas.
- Testado via Playwright contra o backend real: lista + aviso do bug em Convênios; em Emendas
  Parlamentares, criar → editar → filtrar por tipo (confirmando que selecionar tipo limpa o
  filtro de ano) → excluir, ciclo completo. Zero erro de console.

### 7.10 Obras Públicas e Repasses (2026-07-16)

`/admin/obras` (`src/modules/admin/obras/`) — lista + CRUD da obra em si, e
`/admin/obras/[id]` com 3 abas (Medições, Anexos, ART) pros sub-recursos
`/obras/{id}/medicoes`, `/obras/{id}/anexos` (multipart `anexo`+`arquivo`) e
`/obras/{id}/arts` (multipart `dto`+`pdf`). `GET /obras` não é paginado, mesmo padrão de
Convênios.

- **Grupo de permissão**: `'obras-repasses'` (admin-only editar/excluir) pra obra, medições e
  anexos — **exceto ART**, que segundo o prompt (`### 6.5`) não é admin-only: `MANAGER` pode
  criar/editar/excluir. A aba de ART usa o grupo `'padrao'` em vez de `'obras-repasses'` nas
  chamadas de `podeCriar`/`podeExcluir` só por isso (mesma função, grupo diferente — não é
  código duplicado por engano).
- **Campos calculados da obra** (`totalObra, totalMedicao, totalMedicaoPaga, saldoObra,
  saldoConta, percentualObra, percentualFinanceiro`) vêm do backend e **não são o mesmo que o
  `valorTotal`** que o usuário digita no formulário — `totalObra` é somado a partir dos
  `contratos`/aditivos vinculados à obra (módulo Licitações, ainda não implementado no admin),
  então fica `0` até esse módulo existir. O card de detalhe mostra `valorTotal` (o campo
  digitado) como "Valor total" e os campos calculados como "Total medido"/"Total pago"/"Saldo",
  sem misturar os dois.
- **Bug real encontrado no backend, reportado e corrigido no mesmo dia**: `MedicaoObraServiceImpl.salvar/atualizar/deletar`
  só chamavam `medicaoObraRepository.save/deleteById` na entidade filha `MedicaoObra` — nunca
  tocavam a entidade pai `ObraPublica`, e o recálculo de `totalMedicao`, `saldoObra`,
  `saldoConta`, `percentualObra` e `percentualFinanceiro` mora no `@PrePersist`/`@PreUpdate`
  `calcularCamposAutomaticos()` da própria `ObraPublica` — então criar/editar/excluir uma
  medição nunca atualizava esses totais na obra. Confirmado via API real antes do fix (medição
  de R$ 15.000 numa obra nova, `GET /api/obras/{id}` continuava com `totalMedicao: 0.0`) e
  depois do fix (mesmo teste, `totalMedicao` refletiu os R$ 15.000 corretamente). O backend
  agora chama `recalcularTotaisDaObra(obra)` (que roda `calcularCamposAutomaticos()` +
  `save`) depois de salvar/atualizar/excluir a medição. O frontend já buscava a obra de novo
  (`aoAtualizar`) depois de criar/editar/excluir uma medição — isso é o que fez o fix aparecer
  imediatamente na tela sem precisar de mudança nenhuma no frontend.
- **Nuance esperada, não é bug**: com `totalObra` ainda em `0` (depende de contratos
  vinculados, módulo Licitações não implementado no admin), qualquer medição cadastrada deixa
  `saldoObra` negativo (`0 - totalMedicao`) e `percentualObra` em `0%` (guard contra divisão
  por zero no backend). É matemática correta dado que falta o módulo de contratos — vai se
  resolver sozinho quando Licitações for implementado (item 5 da lista da seção 7.5).
- Testado via Playwright contra o backend real: criar obra → abrir detalhe → criar medição →
  editar medição → criar anexo (upload PDF real) → criar ART (upload PDF real) → excluir
  medição, ciclo completo pelas 3 abas. Zero erro de console (incluindo depois do fix do
  `formatarMoeda` crashando em campo calculado `null` e do `formatarData` quebrando em
  `ultimaAtualizacao`, que é `LocalDateTime` — não `LocalDate` como os outros campos de data).
  Usuário limpou manualmente o primeiro lote de obras de teste (`numero` 9001). Depois do fix
  do backend (ver bug acima), um reteste rápido criou **mais 1 obra de teste** (`numero` 9001,
  local "Praça Central de Teste") pra confirmar que `totalMedicao` recalcula — ainda não
  removida, fica pro usuário limpar junto com o resto.
- Sidebar: "Obras Públicas" entrou no grupo "Convênios e Repasses" (mesma lógica dos outros
  bespoke — o prompt agrupa os três sob a seção 6.5), removido de "Em breve".

## 8. Como retomar

**Pro painel admin, prefira o perfil `postgres`, não o `dev`** — banco real (Postgres via
Docker), dados persistem entre restarts, e já vem populado com fixtures criadas via chamadas
reais à API (licitação, obra pública, convênio, emenda parlamentar, servidor, cargo, diária,
aviso, notícia, ESIC, ouvidoria, lei, tabela de valores, diário oficial). O perfil `dev` (H2
em memória) só tem o admin bootstrap — some tudo a cada restart, então não há nada pra
listar/testar além do que você mesmo criar na hora.

```bash
npm run dev                                                                          # frontend :3000

cd /home/rudinei/Documentos/portal-transparencia-pref
docker compose up -d postgres meilisearch                                           # precisa docker (sudo se seu usuário não estiver no grupo docker)
./mvnw spring-boot:run -Dspring-boot.run.profiles=postgres -DskipTests -Dmaven.test.skip=true  # backend :8080, dados persistentes

curl -s http://localhost:8080/v3/api-docs                                           # confirma o backend e pega o spec atualizado
```

Perfil `dev` (H2, reseta a cada restart) continua disponível se só precisar testar algo
isolado sem depender de fixture: troque `postgres` por `dev` no comando acima e pule o
`docker compose up`.

Login de dev pro painel admin: `admin@prefeitura.dev` / `admin123` (criado automaticamente
no primeiro start, nos dois perfis).

Antes de criar qualquer módulo novo: puxar o spec de novo (pode ter mudado), achar o DTO no
`components.schemas`, comparar com os 4 formatos da seção 4 (site público) ou os padrões da
seção 7.1 (admin), e só then escrever código.
