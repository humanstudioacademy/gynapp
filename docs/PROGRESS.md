# 📊 Progresso da Execução

[← Voltar ao índice](./README.md)

> Rastreador vivo do projeto. Atualizar ao fim de cada fase — o que entregou, o que ficou
> pendente e o que mudou de rumo. O plano em si fica nos documentos numerados; **aqui fica a realidade.**

**Última atualização:** 14/08/2026 · **Fase atual:** ✅ Fase 4 concluída — o app já registra treino de verdade · 🟡 Fase 1 aguardando SMTP e rate limits

---

## Visão geral

```
Planejamento  ██████████████████████████████  100%  ✅ Concluído
Fase 0        ██████████████████████████████  100%  ✅ Concluída
Fase 1        ██████████████████████████░░░░   85%  🟡 Falta SMTP + rate limits
Fase 2        ██████████████████████████████  100%  ✅ Concluída
Fase 3        ██████████████████████████████  100%  ✅ Concluída
Fase 4 ⭐     ██████████████████████████████  100%  ✅ Concluída
Fase 5        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Próxima
Fase 6        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 7        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 8        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 9        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
```

| Fase | Status | Início | Fim | Observações |
|---|---|---|---|---|
| Planejamento | ✅ Concluída | 13/08/26 | 14/08/26 | 13 documentos + seeds do banco |
| Design system v2 | ✅ **Concluída** | 14/08/26 | 14/08/26 | Linguagem lima; tokens aplicados no código; docs 05/06/07/12 revisados |
| 0 — Fundação | ✅ **Concluída** | 14/08/26 | 14/08/26 | Expo SDK 57 + banco aplicado e validado |
| 1 — Auth e perfil | 🟡 **Código pronto** | 14/08/26 | — | Faltam SMTP próprio e rate limits (dependem de conta externa) |
| 2 — Exercícios | ✅ **Concluída** | 14/08/26 | 14/08/26 | Biblioteca, busca, filtros, detalhe, personalizados e seletor |
| 3 — Rotinas | ✅ **Concluída** | 14/08/26 | 14/08/26 | Rotinas, fichas, editor de prescrição, bi-set e galeria de templates |
| 4 — Player ⭐ | ✅ **Concluída** | 14/08/26 | 14/08/26 | Treino registrado de ponta a ponta, com PRs disparando |
| 5 — Progresso | ⏳ Próxima | — | — | Sessões já existem: dashboard e gráficos podem ler dados reais |
| 6 — Corpo e metas | ⬜ | — | — | Abrir contas Apple/Google nesta fase |
| 7 — Polimento | ⬜ | — | — | Iniciar teste fechado do Play aqui |
| 8 — Beta | ⬜ | — | — | |
| 9 — Publicação | ⬜ | — | — | |

---

## Artefatos já entregues

### Documentação (14 arquivos em `docs/`)

| Documento | Status |
|---|---|
| [README](./README.md) — índice | ✅ |
| [00 — Visão Geral](./00-visao-geral.md) | ✅ |
| [01 — Arquitetura](./01-arquitetura-tecnica.md) | ✅ |
| [02 — Modelo de Dados](./02-modelo-de-dados.md) | ✅ |
| [03 — Migrations e SQL](./03-migrations-e-sql.md) | ✅ |
| [04 — Segurança e RLS](./04-seguranca-rls-e-auth.md) | ✅ |
| [05 — Mapa de Telas](./05-mapa-de-telas.md) | ✅ |
| [06 — Funcionalidades](./06-funcionalidades-e-user-stories.md) | ✅ |
| [07 — Design System](./07-design-system-e-ux.md) | ✅ |
| [08 — Roadmap](./08-roadmap-e-fases.md) | ✅ |
| [09 — Publicação](./09-publicacao-nas-lojas.md) | ✅ |
| [10 — Qualidade e CI/CD](./10-qualidade-testes-e-cicd.md) | ✅ |
| [12 — Referências Visuais](./12-referencias-visuais.md) | ✅ **novo** — origem da linguagem v2 |
| [11 — Decisões](./11-decisoes-e-pendencias.md) | ✅ |

### Banco de dados (`supabase/`)

| Artefato | Status | Onde |
|---|---|---|
| 16 migrations (schema, triggers, RPCs, RLS, storage, busca, pausa) | ✅ **Aplicadas em produção** | `supabase/migrations/` |
| Seed de grupos musculares e equipamentos | ✅ **Arquivo pronto** | `supabase/seed/01_catalog.sql` |
| Seed de 138 exercícios + músculos secundários | ✅ **Arquivo pronto** | `supabase/seed/02_exercises.sql` |
| Seed de 5 templates de treino | ✅ **Arquivo pronto** | `supabase/seed/03_templates.sql` |
| Orquestrador do seed com validação | ✅ **Arquivo pronto** | `supabase/seed.sql` |

### Código do app

| Artefato | Status |
|---|---|
| Projeto Expo SDK 57 + Expo Router + TypeScript strict | ✅ |
| NativeWind v4 com os tokens do design system | ✅ |
| `app.config.ts` com 3 ambientes · `eas.json` | ✅ |
| Cliente Supabase com SecureStore | ✅ |
| `database.types.ts` gerado do banco (1.409 linhas) | ✅ |
| TanStack Query + query keys centralizadas | ✅ |
| Tokens de tema + ThemeProvider (claro/escuro) | ✅ |
| Primitivos `Button`, `Card`, `Screen` | ✅ |
| Utilitários: `calculations`, `units`, `format` | ✅ |
| `scripts/db.sh` (migrate · seed · psql · types) | ✅ |
| Ícones e splash (placeholder gerado) | ✅ |
| ~~Tela de verificação da Fase 0~~ | ✅ substituída pelas telas reais na Fase 1 |

### Código da Fase 1 (auth, onboarding, perfil)

| Artefato | Status |
|---|---|
| `AuthProvider` + `useAuthGuard` (guards do doc 04, seção 1.5) | ✅ |
| 5 telas em `app/(auth)/` + 2 rotas de deep link em `app/auth/` | ✅ |
| 4 telas em `app/onboarding/` com barra de progresso e "pular" | ✅ |
| Tabs (`Início`, `Treinos`, `Progresso`, `Perfil`) | ✅ |
| Perfil com edição e upload de avatar | ✅ |
| Configurações: conta, notificações, aparência, unidades, privacidade | ✅ |
| Exclusão de conta (Storage + `delete_my_account` + signOut) | ✅ |
| Edge Function `supabase/functions/delete-account/` | ✅ escrita · ❌ não deployada |
| Schemas Zod + React Hook Form em todos os formulários | ✅ |
| Primitivos novos: `Input`, `Toast`, `EmptyState`, `ErrorState`, `Avatar`, `Switch`, `SegmentedControl`, `ProgressBar`, `Sheet`, `ConfirmDialog`, `ListRow`, `Header`, `OptionCard`, `BootSplash` | ✅ |
| i18n estruturado (`src/i18n/`) com os rótulos dos enums | ✅ |
| Tema claro/escuro dirigido por `user_settings.theme` | ✅ |

### Código das Fases 2 e 3 (exercícios, rotinas e fichas)

| Artefato | Status |
|---|---|
| `src/features/exercises/` — api, hooks, lista, filtros, formulário, store do seletor | ✅ |
| `src/features/plans/` — api, hooks, formulário de rotina, formatação da prescrição | ✅ |
| Biblioteca, detalhe e CRUD de exercício personalizado (4 telas) | ✅ |
| Seletor de exercícios com seleção múltipla (modal) | ✅ |
| Rotinas: tab, nova, detalhe, edição, galeria de templates (5 telas) | ✅ |
| Fichas: detalhe e editor de prescrição (2 telas) | ✅ |
| `PlanCard`, `ExerciseThumb`, `ExerciseListItem`, `Chip`, `ReorderControls` | ✅ |
| `estimateDayMinutes` — duração da ficha considerando bi-set | ✅ |

---

## Fase 0 — resultado

Concluída em 14/08/2026. Todos os entregáveis do [roadmap](./08-roadmap-e-fases.md#fase-0--fundação-e-infraestrutura)
foram atendidos, com duas exceções registradas abaixo.

### Validação executada

| Verificação | Resultado |
|---|---|
| 14 migrations aplicam do zero | ✅ |
| Seed carrega 138 exercícios / 5 templates / 18 fichas / 105 prescrições | ✅ |
| Trigger `handle_new_user` cria `profiles` + `user_settings` | ✅ |
| `start_workout_session` pré-preenche as séries com as metas | ✅ |
| Idempotência por `client_id` (retry offline não duplica) | ✅ |
| Trigger de volume: aquecimento não conta | ✅ |
| Triggers de PR: `max_weight`, `max_volume_set`, `estimated_1rm` (Epley) | ✅ |
| PR não rebaixa com carga menor; `previous_value` correto | ✅ |
| `finish_workout_session` limpa séries incompletas e retorna resumo | ✅ |
| `get_dashboard_summary`, `get_exercise_history`, `copy_plan_template` | ✅ |
| **RLS: usuário B não lê/edita/apaga nada de A** (7 tabelas) | ✅ |
| RLS: B só enxerga as 18 fichas de template, nenhuma de A | ✅ |
| Views respeitam `security_invoker` | ✅ |
| Papel anônimo bloqueado | ✅ |
| `delete_my_account` remove tudo em cascata | ✅ |
| `npm run typecheck` e `npm run lint` | ✅ limpos |
| Render nos temas claro e escuro | ✅ |
| Login → sessão → consulta protegida por RLS pela UI | ✅ |

**Total: 67 checagens automatizadas passaram.**

### Pendências herdadas da Fase 0

| Item | Situação | Impacto |
|---|---|---|
| ~~Build nativo iOS/Android local~~ | ✅ **Resolvido em 14/08/26** — emulador Android (Pixel 8, API 36) rodando o app via Expo Go | Falta só o iOS, que depende do Xcode |
| Ambientes `dev` e `staging` no Supabase | ❌ Só existe o projeto atual | Migrations estão sendo aplicadas direto no projeto de produção |
| Sentry | ⬜ Adiado para a Fase 7 | Nenhum — não há usuários ainda |
| Husky + lint-staged + Commitlint | ⬜ Adiado | Baixo |

---

## Fase 1 — resultado parcial

Iniciada e codificada em 14/08/2026. **O app está funcional de ponta a ponta**, mas dois
entregáveis do [roadmap](./08-roadmap-e-fases.md#fase-1--autenticação-e-perfil) dependem de
serviço externo e continuam abertos — a fase não fecha sem eles.

### Entregáveis

| Item | Status |
|---|---|
| `AuthProvider` com `onAuthStateChange` e guards de rota | ✅ |
| 7 telas do grupo AUTH | ✅ (5 em `(auth)/` + 2 rotas de deep link em `auth/`) |
| 4 telas de onboarding | ✅ |
| Validação com Zod + React Hook Form em todos os formulários | ✅ |
| Deep links `gymapp://auth/*` | 🟡 implementados; **não testados** (falta SMTP e build nativo) |
| **SMTP próprio (Resend/SendGrid) com templates em PT-BR** | ❌ **pendente — depende de conta externa** |
| **Rate limits do Auth no Dashboard** | ❌ **pendente — depende de acesso ao Dashboard** |
| Tela de perfil com edição e upload de avatar | 🟡 código pronto; upload não verificado (precisa de picker nativo) |
| Fluxo de excluir conta + Edge Function `delete-account` | ✅ fluxo verificado · 🟡 função escrita, não deployada |
| Tela de configurações com tema e unidades funcionando | ✅ |
| Componentes `Button`, `Input`, `Card`, `Screen`, `Toast`, `EmptyState` | ✅ |

### Validação executada (alvo web, mesmo bundle Metro)

| Verificação | Resultado |
|---|---|
| Sem sessão, qualquer rota cai em `/welcome` | ✅ |
| Zod barra o cadastro e mostra os 4 erros em PT-BR | ✅ |
| Login → guard manda para o onboarding (perfil incompleto) | ✅ |
| Onboarding 1/4: nome, máscara DD/MM/AAAA e sexo gravam em `profiles` | ✅ |
| Onboarding 2/4: altura em `profiles`, peso vira linha em `body_measurements` | ✅ |
| Onboarding 3/4: objetivo e nível gravam em `profiles` | ✅ |
| Onboarding 4/4: `onboarding_completed = true` e guard leva às tabs | ✅ |
| Recarregar a página mantém a sessão | ✅ |
| Trocar tema para escuro aplica na hora e persiste em `user_settings.theme` | ✅ |
| Excluir conta zera `auth.users`, `profiles`, `user_settings`, `body_measurements` | ✅ |
| `npm run typecheck` e `npm run lint` | ✅ limpos |

### Bugs encontrados e corrigidos na própria verificação

| Bug | Correção |
|---|---|
| Onboarding gravava direto na API sem tocar no cache do React Query — o guard relia `onboarding_completed = false` e devolvia o usuário ao passo 1 | Passos viraram mutations (`src/features/onboarding/hooks.ts`) que escrevem a resposta do servidor no cache antes de navegar |
| `authErrorMessage` casava qualquer mensagem com "invalid" e respondia "Esse link expirou" — inclusive para e-mail inválido | Mapa por `error_code` do GoTrue primeiro, texto só como fallback |
| `colorScheme.set()` do NativeWind lançava na web (`darkMode` estava como `media`) | `darkMode: 'class'` no Tailwind + fallback que alterna a classe no `<html>` enquanto o CSS do Expo não chega |
| `Alert.alert` é no-op no React Native Web: sair da conta e excluir conta não abriam confirmação nenhuma | Substituído pelo `ConfirmDialog` próprio, que funciona nas três plataformas |

### O que falta para fechar a Fase 1

1. **SMTP próprio** (Resend/SendGrid/SES) no Dashboard do Supabase, com templates em PT-BR.
   Sem isso não dá para testar confirmação de e-mail nem recuperação de senha ponta a ponta.
2. **Rate limits do Auth** conforme o [doc 04, seção 1.6](./04-seguranca-rls-e-auth.md).
3. **Redirect URLs** `gymapp://auth/callback` e `gymapp://auth/reset-password` liberadas no Dashboard.
4. Verificar o upload de avatar e os deep links num **build nativo** (pendência herdada da Fase 0).
5. Deploy da Edge Function: `supabase functions deploy delete-account`.

---

## Fase 2 — resultado

Concluída em 14/08/2026. Todos os entregáveis do
[roadmap](./08-roadmap-e-fases.md#fase-2--biblioteca-de-exercícios) foram atendidos.

### Entregáveis

| Item | Status |
|---|---|
| Biblioteca com FlashList e seções por grupo muscular | ✅ |
| Busca full-text com debounce de 300ms | ✅ |
| Filtros combináveis: grupo muscular, equipamento, favoritos, meus | ✅ |
| Tela de detalhe do exercício | ✅ (histórico e recordes ficam para a Fase 5 — dependem de sessões) |
| Criar / editar / excluir exercício personalizado | ✅ |
| Favoritar com atualização otimista | ✅ |
| Modal seletor com seleção múltipla | ✅ — a seleção volta pela store `pickerStore`, pronta para a Fase 3 |
| `ExerciseThumb` com fallback colorido por grupo muscular | ✅ |

### Correção de schema que a fase exigiu

O `search_vector` original tinha **dois furos** que só apareceram ao usar de verdade:

| Problema | Antes | Depois |
|---|---|---|
| Não ignorava acento — `to_tsvector('portuguese', …)` puro | "triceps" achava **2** | acha **10** |
| Indexava só nome e descrição; quem busca por músculo ou equipamento não achava nada | "biceps" achava **0**, "halter" **0** | **10** e **31** |

Migration `20260814001500_search_unaccent.sql`: wrapper `immutable_unaccent`, coluna
`search_terms` mantida por trigger (junta nome, descrição, grupo muscular e equipamento) e
`search_vector` gerado a partir dela. O termo digitado é normalizado no cliente antes do
`.textSearch()`.

### Validação executada

| Verificação | Resultado |
|---|---|
| Busca "biceps" (sem acento) devolve os 10 exercícios de Bíceps | ✅ |
| Busca "TRICEPS" (maiúscula, sem acento) devolve 10 | ✅ |
| Busca "supino halter" aplica AND entre os termos | ✅ 2 resultados |
| Latência da busca no banco | ✅ **0,118 ms** pelo índice GIN (critério: < 300ms) |
| Filtros combinados (Peito + Halter) | ✅ 5 resultados corretos |
| Aba Favoritos lista só o que foi favoritado | ✅ |
| Favoritar atualiza na hora e persiste após recarregar | ✅ |
| Criar exercício personalizado → detalhe com "só você vê" | ✅ |
| **RLS: usuário B não enxerga o exercício de A** (nem por nome exato) | ✅ B recebe `[]`; vê só os 138 públicos |
| Papel anônimo bloqueado na tabela `exercises` | ✅ |
| Excluir a conta cascateia o exercício personalizado | ✅ catálogo volta a 138 |
| `npm run typecheck` e `npm run lint` | ✅ limpos |

### Bugs encontrados e corrigidos na verificação

| Bug | Correção |
|---|---|
| Estrela de favorito era `Pressable` dentro do `Pressable` da linha — HTML inválido (`<button>` aninhado) e o leitor de tela não alcançava o botão de dentro | Estrela virou irmã da linha dentro de um `View` |
| Seletor aberto por deep link travava: `router.back()` sem histórico | `dismiss()` cai na biblioteca quando não há para onde voltar |

### Fora do escopo desta fase

- **Scroll a 60fps com 150 itens** não foi medido: exige aparelho físico e build nativo
  (pendência herdada da Fase 0). A lista usa FlashList com `getItemType`, que é o que o plano pede.
- Histórico e recordes no detalhe do exercício dependem de `workout_sessions` — Fase 5.

---

## Fase 3 — resultado

Concluída em 14/08/2026. Todos os entregáveis do
[roadmap](./08-roadmap-e-fases.md#fase-3--rotinas-e-fichas) foram atendidos.

### Entregáveis

| Item | Status |
|---|---|
| Tab "Treinos" com rotinas do usuário e acesso aos templates | ✅ |
| Criar / editar / duplicar / arquivar rotina | ✅ (duplicar reusa a RPC `copy_plan_template`) |
| CRUD de fichas com reordenação | ✅ — por botões, não por arrasto (ver decisão abaixo) |
| Editor de ficha: adicionar exercícios, metas, reordenar, remover | ✅ |
| Agrupamento em bi-set / tri-set | ✅ |
| Galeria de templates com pré-visualização e `copy_plan_template()` | ✅ |
| Definir rotina ativa | ✅ (`profiles.active_plan_id`) |
| Estimativa automática de duração da ficha | ✅ `estimateDayMinutes` em `src/utils/calculations.ts` |

### Validação executada

| Verificação | Resultado |
|---|---|
| Listar templates com contagem de fichas (embed aninhado) | ✅ os 5 templates, 3 a 5 fichas cada |
| `copy_plan_template` gera cópia independente | ✅ `source=user`, `is_template=false`, dono correto, 3 fichas e 20 exercícios |
| Detalhe da ficha com exercício + grupo muscular + equipamento | ✅ embed de 3 níveis resolvendo |
| Reordenar exercícios persiste | ✅ 1º movido para a 3ª posição, ordem confirmada no banco |
| Agrupar em bi-set persiste e aparece na UI | ✅ "BI-SET A" com borda destacada |
| Estimativa de duração | ✅ ~39 min para 7 exercícios / 23 séries — a UI bate com o cálculo independente |
| Excluir rotina preserva histórico | ✅ por schema: `workout_sessions.plan_id` e `workout_day_id` são `on delete set null` |
| **App rodando em runtime nativo** (emulador Android) | ✅ pela primeira vez — encerra a pendência da Fase 0 |
| Módulos da Fase 3 no bundle Android | ✅ todos presentes |
| `npm run typecheck` e `npm run lint` | ✅ limpos |

### Ambiente nativo — pendência da Fase 0 resolvida

Instalados em 14/08/26: `platform-tools`, `platforms;android-36`, a system image ARM64 do Android
36 e o `cmdline-tools` dentro do SDK (5,6 GB no total). Java 17 e o cask
`android-commandlinetools` já existiam no brew. AVD **GymApp_Pixel8** criado, emulador de pé e
Expo Go instalado nele.

Detalhe que custou tempo: o `avdmanager` do Homebrew procura as system images no diretório dele
(`/opt/homebrew/share/android-commandlinetools`), não no `ANDROID_HOME`. A saída foi instalar o
`cmdline-tools` **dentro** do SDK e usar aquele binário.

**iOS continua sem simulador** — depende do Xcode, que exige download pela App Store e um
`sudo xcode-select` que só o Leonardo pode rodar.

---

## Fase 4 — resultado ⭐

Concluída em 14/08/2026. **O marco crítico do projeto**: a partir daqui o app é usável de
verdade — dá para treinar com ele.

### Entregáveis

| Item | Status |
|---|---|
| `start_workout_session()` integrada, séries pré-preenchidas | ✅ 23 séries criadas a partir das metas da ficha |
| Tela do player conforme o wireframe do doc 05 | ✅ |
| `SetRow` com edição inline de kg e reps | ✅ campos adaptados ao `tracking_type` |
| Marcar série em 1 toque, com haptic e atualização otimista | ✅ |
| Última performance por exercício | ✅ via `v_exercise_last_performance` |
| Timer de descanso: auto-início, ±15s, pular, segundo plano | ✅ |
| Notificação local + som + vibração ao fim do descanso | ✅ agendada no SO |
| Cronômetro geral com pausa | ✅ e a pausa **não** conta na duração |
| Adicionar/remover série e exercício durante o treino | ✅ |
| Estado da sessão sobrevive a fechar o app | ✅ pelo banco (as séries são linhas) |
| Retomar sessão ativa ao reabrir | ✅ card "Continuar treino" no dashboard |
| Cancelar e finalizar com confirmação | ✅ 3 opções: continuar depois, descartar, cancelar |
| `finish_workout_session()` integrada | ✅ |
| Resumo pós-treino com PRs | ✅ |
| `expo-keep-awake` durante o treino | ✅ respeitando `keep_screen_on` |

### Validação executada

| Verificação | Resultado |
|---|---|
| Sessão nasce com as séries pré-preenchidas pelas metas | ✅ 23 séries |
| Volume ignora aquecimento (RN-01) | ✅ 2.900 kg — a série `warmup` não somou |
| Contagem de séries ignora aquecimento | ✅ 4 de 5 marcadas |
| Triggers de PR: `max_weight`, `max_volume_set`, `estimated_1rm` | ✅ 80 kg, 800 kg, 106,67 (Epley confere) |
| `previous_value` do recorde | ✅ 70 → 80 kg |
| `finish` remove séries incompletas | ✅ 23 → 5 |
| Duração desconta o tempo pausado | ✅ 20s de treino − 8s de pausa = 12s gravados |
| Timer de descanso inicia sozinho no valor da ficha | ✅ 2:00 na Barra Fixa |
| Resumo mostra os 3 recordes com o ganho | ✅ 90 kg ▲ +10, 900 kg ▲ +100, 1RM 120 ▲ +13,3 |
| `npm run typecheck` e `npm run lint` | ✅ limpos |

### Bugs encontrados e corrigidos na verificação

| Bug | Correção |
|---|---|
| `useKeepAwake()` derrubava o player com "The wake lock has not activated yet" — o desativar corria antes do ativar resolver | `useKeepScreenOn` próprio, com as duas pontas tratadas e respeitando `user_settings.keep_screen_on` |
| **O checkbox saía da tela**: com `flex-1` nos campos, a coluna de concluir ficava cortada — e marcar série é a interação central do app | Larguras fixas no `SetRow`; remover série virou toque longo em vez de um X permanente roubando espaço |
| O player continuava montado e seu efeito de "sessão sumiu" disparava `router.replace('/')` **por cima da tela de resumo** | Removido o redirecionamento automático: sem sessão, o player mostra estado vazio |
| `finish_workout_session` calculava duração por relógio de parede — 20 min de pausa entravam no treino | Migration `20260814001600`: coluna `paused_seconds` e o finish subtraindo |

### Ambiente

Os dois simuladores rodando o app: **iPhone 17 Pro** (iOS 26.5, Xcode 26.6) e **Pixel 8**
(API 36). O `scripts/db.sh` deixou de depender do Docker — passa a usar `psql` nativo
(`brew install libpq`) e cai para o Docker só se não achar. O Docker Desktop caiu duas vezes
no meio da sessão e travou o fluxo; agora não trava mais.

O gerador de tipos do Supabase CLI ainda exige Docker. O `db.sh types` foi corrigido para
escrever num temporário: numa das falhas ele sobrescreveu o `database.types.ts` com o JSON
do erro e destruiu o arquivo.

## Registro de decisões tomadas durante a execução

> Registrar aqui toda decisão que desviar do plano, com o motivo. Se for arquitetural, criar também
> um ADR no [doc 11](./11-decisoes-e-pendencias.md#2-decisões-arquiteturais-adrs).

| Data | Fase | Decisão | Motivo |
|---|---|---|---|
| 14/08/26 | 0 | Bundle ID `ai.thehuman.gymapp` | Derivado do domínio `the-human.ai` (package Android não aceita hífen). **Alterável até a primeira submissão** |
| 14/08/26 | 0 | Migrations aplicadas via `psql` em Docker | Host direto do Supabase é IPv6-only e a máquina não tem IPv6; usamos o pooler `aws-0-sa-east-1:5432` |
| 14/08/26 | 0 | Escala de toque do `Button` via `Pressable`, não Reanimated | A regra `react-hooks/immutability` do React Compiler barra mutar shared value fora de worklet |
| 14/08/26 | 0 | Verificação da Fase 0 feita no alvo web | Sem Xcode/Android SDK na máquina; é o mesmo bundle Metro + react-native-web |
| 14/08/26 | 0 | `start_free_session()` adicionada ao plano original | US-5.1 prevê treino livre sem ficha; faltava a RPC |
| 14/08/26 | 0 | PR de `best_duration` incluído no trigger | Exercícios com `tracking_type = duration` (prancha) não gerariam recorde |
| 14/08/26 | 1 | Projeto movido para `~/Materiais/Aplicativo Mobile` | Estava na Mesa sincronizada pelo iCloud, que moveu a pasta duas vezes durante a sessão. Projeto Node/Expo não deve viver em pasta sincronizada |
| 14/08/26 | 1 | Deep links em `app/auth/*` (pasta real), não em `(auth)/` | Grupo entre parênteses não entra na URL: `gymapp://auth/reset-password` não resolveria para `(auth)/reset-password` |
| 14/08/26 | 1 | Onboarding em `app/onboarding/*`, não em `(onboarding)/` | `(onboarding)/profile` e `(tabs)/profile` colidiriam na mesma URL `/profile` |
| 14/08/26 | 1 | Sem `app/index.tsx`; `/` é a index das tabs | Um `index.tsx` na raiz criaria rota ambígua com `(tabs)/index`. O splash virou overlay do layout raiz enquanto sessão e perfil carregam |
| 14/08/26 | 1 | `flowType: 'pkce'` no cliente Supabase | Os links de e-mail chegam por deep link com `?code=`, trocado por sessão em `app/auth/*` (doc 04, seção 1.1) |
| 14/08/26 | 1 | `darkMode: 'class'` no Tailwind | A preferência do usuário sobrescreve a do sistema; com `media` o NativeWind não deixa trocar o tema por código |
| 14/08/26 | 1 | `ConfirmDialog` próprio no lugar de `Alert.alert` | `Alert` é no-op no React Native Web — a confirmação destrutiva simplesmente não abria fora do celular |
| 14/08/26 | 1 | Exclusão de conta feita pelo cliente (Storage + RPC) | A Edge Function está escrita mas exige deploy com CLI autenticada. As policies de Storage já permitem o dono apagar a própria pasta, então o fluxo fecha sem ela |
| 14/08/26 | 1 | i18n estruturado só com rótulos de enum na Fase 1 | Decisão D5 pede a estrutura desde já; a extração de todas as strings de tela é entregável da Fase 6 |
| 14/08/26 | 1 | `expo-file-system` e `expo-crypto` promovidos a dependências diretas | Usados no upload de avatar (`arrayBuffer`) e no `client_id` das medições |
| 14/08/26 | 2 | `search_terms` mantido por trigger, com grupo muscular e equipamento | Coluna gerada não enxerga outra tabela. Sem isso, "biceps", "peito" e "halter" não achavam nada — os nomes dos exercícios são "Rosca Direta", "Supino…" |
| 14/08/26 | 2 | Termo de busca normalizado no cliente (NFD) | Permite usar `.textSearch()` do supabase-js direto, sem criar uma RPC só para aplicar `unaccent` no termo |
| 14/08/26 | 2 | Seleção do seletor volta por store zustand (`pickerStore`) | O Expo Router não devolve valor ao fechar um modal |
| 14/08/26 | 2 | Detalhe do exercício sem histórico/recordes | US-3.2 pede, mas depende de `workout_sessions`, que só existe a partir da Fase 4. A tela avisa isso ao usuário |
| 14/08/26 | 3 | Reordenação por botões (↑/↓), não por arrasto | `react-native-draggable-flatlist` não acompanha o Reanimated 4 deste SDK. Mais importante: arrastar é inalcançável no VoiceOver/TalkBack. Voltar a oferecer o arrasto por cima é polimento da Fase 7 |
| 14/08/26 | 3 | Duplicar rotina reusa `copy_plan_template` | A RPC já copia fichas e prescrições e grava `owner_id = auth.uid()`; escrever um segundo caminho de cópia seria duplicar regra |
| 14/08/26 | 3 | Botão "Iniciar treino" visível porém desabilitado na ficha | Deixa claro para onde a ficha leva sem fingir que a Fase 4 existe |
| 14/08/26 | 3 | `cmdline-tools` instalado dentro do `ANDROID_HOME` | O `avdmanager` do brew procura as system images no diretório dele e não enxergava o SDK do usuário |
| 14/08/26 | 4 | Coluna `paused_seconds` + finish descontando | Sem ela a pausa entrava na duração do treino e contaminava histórico e médias |
| 14/08/26 | 4 | Estado da sessão persiste no banco, não em MMKV | As séries já são linhas: fechar e reabrir o app retoma sozinho. MMKV entra na Fase 7, junto do outbox offline, que é onde ele realmente é necessário |
| 14/08/26 | 4 | Remover série é toque longo, não botão visível | O X permanente empurrava o checkbox para fora da tela em aparelho estreito |
| 14/08/26 | 4 | `scripts/db.sh` usa `psql` nativo e só cai para o Docker | Docker Desktop caiu duas vezes na sessão e bloqueou migration e geração de tipos |

---

## Bugs conhecidos

| ID | Severidade | Descrição | Fase detectada | Status |
|---|---|---|---|---|
| — | — | — | — | — |

---

## Métricas por fase

Preencher ao fechar cada fase — ajuda a calibrar as estimativas seguintes.

| Fase | Estimado | Real | Desvio | Telas | Testes |
|---|---|---|---|---|---|
| 0 | 1 sem | — | — | 0 | — |
| 1 | 1,5 sem | — | — | 11 + 4 tabs + 4 config | — |
| 2 | 1 sem | — | — | 4 (3 + seletor) | — |
| 3 | 1,5 sem | — | — | 7 | — |
| 4 | 2 sem | — | — | 5 | — |
| 5 | 1,5 sem | — | — | 5 | — |
| 6 | 1 sem | — | — | 7 | — |
| 7 | 1 sem | — | — | 0 | — |
| 8 | 1,5 sem | — | — | 0 | — |
| 9 | 1 sem | — | — | 0 | — |

---

[← Índice](./README.md)
