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

Também vale registrar: o backend (`portal-transparencia-pref`) não sobe com `./mvnw
spring-boot:run` direto — os testes têm erros de compilação pré-existentes (`FiscalContratos`,
`ServidorServiceImplTest`, assinaturas desatualizadas, não relacionado aos bugs acima).
Precisa `-DskipTests -Dmaven.test.skip=true` pra só rodar a aplicação sem compilar os testes.

### 7.3 Próximos passos (módulos bespoke, não implementados ainda)

Nesta ordem sugerida (do mais isolado/simples pro mais complexo):
1. **Institucional** (avisos/notícias — CRUD já teria form pronto no site público, só faltando
   a versão admin) e **fornecedores/unidades/tabela de valores de diária**.
2. **ESIC e Ouvidoria** — só PUT de config + leitura de formulários recebidos (sem DELETE
   ainda, não construir esse botão).
3. **RH bespoke**: servidor, folha de pagamento, cargos, diárias (todas paginadas, sem usar o
   padrão genérico) e concursos (⚠️ upload de anexo de concurso está quebrado no backend —
   não construir essa tela ainda).
4. **Convênios e Emendas Parlamentares** (bespoke, com sub-recursos).
5. **Obras Públicas e Repasses** (obra + medições + anexos + ART, ART não é admin-only).
6. **Licitações** (licitação + contratos + aditivos + fiscal-contratos, com o aviso de upload
   de documento de contrato com assinatura ambígua no backend — testar antes de confiar).
7. **Diário Oficial** — o mais complexo: fluxo de publicação com aprovação humana e assinatura
   digital (stepper de status `RECEBIDO → ... → PUBLICADO`, com `FALHOU`/retomar).

## 8. Como retomar

```bash
npm run dev                                                                       # frontend :3000
cd /home/rudinei/Documentos/portal-transparencia-pref && \
  ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev -DskipTests -Dmaven.test.skip=true  # backend :8080 (perfil dev, H2 em memória, reseta a cada restart)
curl -s http://localhost:8080/v3/api-docs                                        # confirma o backend e pega o spec atualizado
```

Login de dev pro painel admin: `admin@prefeitura.dev` / `admin123` (criado automaticamente
no primeiro start).

Antes de criar qualquer módulo novo: puxar o spec de novo (pode ter mudado), achar o DTO no
`components.schemas`, comparar com os 4 formatos da seção 4 (site público) ou os padrões da
seção 7.1 (admin), e só then escrever código.
