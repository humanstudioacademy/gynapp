# 11 — Decisões, Pendências e Riscos

[← Voltar ao índice](./README.md)

> **Status: plano fechado.** Todas as decisões de produto e arquitetura foram tomadas e estão
> registradas aqui. Sobrou **um único item** que depende exclusivamente de você — a
> [identidade do app](#-o-único-item-que-falta-identidade-do-app).
> Cada decisão traz o caminho de reversão, caso você discorde de alguma.

---

## 🔴 O único item que falta: identidade do app

Preciso de três valores para rodar a Fase 0. O **bundle ID não pode ser alterado depois de
publicado** — por isso é o único ponto realmente bloqueante.

| Campo | Placeholder usado no plano | O que você precisa definir |
|---|---|---|
| Nome do app | `GymApp` | Nome comercial (até 30 caracteres nas lojas) |
| Bundle ID / package | `com.seudominio.gymapp` | `com.<seudominio>.<app>` — em ordem inversa do seu domínio |
| Domínio | — | Onde ficará a Política de Privacidade (pode ser GitHub Pages grátis) |
| Titularidade | — | Publicar como **pessoa física** ou **empresa**? (PJ exige D-U-N-S, ~1 mês) |

**Enquanto isso não vem:** o projeto pode ser criado com o placeholder e o bundle ID trocado a
qualquer momento **antes** da primeira submissão, sem custo. O que não dá é trocar depois de publicado.

---

## 1. Decisões de produto fechadas

Cada uma foi decidida com o critério: **o que entrega a v1 mais rápido sem comprometer o produto.**

### D1 — O aluno monta a própria rotina ✅

**Decisão:** o aluno cria a rotina do zero ou copia um dos 5 templates prontos. Não há professor na v1.
**Motivo:** foi o escopo que você definiu ("só a parte do aluno nesse primeiro momento"). Prescrição
por professor exige o módulo de coach inteiro — vínculo, permissões, tela do professor — o que
adicionaria ~3 semanas.
**Reversão:** os campos `workout_plans.coach_id` e `source = 'coach'` já existem no schema. Na v2 basta
criar a tabela de vínculo e as políticas RLS adicionais. **Nenhuma migration destrutiva.**

### D2 — Autenticação só com e-mail e senha ✅

**Decisão:** sem Google, Apple ou telefone na v1.
**Motivo:** login social parece simples, mas dispara a Guideline 4.8 da Apple — **se houver qualquer
login social de terceiro, Sign in with Apple passa a ser obrigatório**. São +3 a 5 dias de trabalho e
mais uma superfície de rejeição, sem ganho para a v1.
**Reversão:** adicionar provedores no Supabase Auth é configuração, não refatoração. Planejado para a v1.2.

### D3 — Mídia dos exercícios

**Decisão:** **lançar a v1 sem GIFs de execução.** O catálogo já tem os 138 exercícios com nome,
grupo muscular, equipamento e **instruções escritas passo a passo** — que é o que o aluno realmente
lê durante o treino.
**Motivo:** este era o maior risco de prazo e o único com exposição jurídica real. Imagem de
exercício encontrada na internet quase sempre tem dono; usar sem licença gera rejeição na loja e
risco de processo. Produzir ou licenciar 138 mídias levaria de 1 a 4 semanas — mais tempo do que
várias fases inteiras do projeto.
**Como fica na UI:** onde não há imagem, o app mostra o ícone colorido do grupo muscular. Fica
consistente e não parece "quebrado".
**Reversão:** `thumbnail_path` e `media_paths` já existem nas tabelas e vêm `NULL` no seed. Adicionar
as imagens depois é um `UPDATE` + upload no bucket `exercise-media` — **sem migration, sem novo build**,
pode ir por OTA. Recomendação: licenciar um pacote comercial (US$ 100–500) e aplicar na v1.1.

### D4 — Gratuito, sem anúncios, sem compras na v1 ✅

**Decisão:** app 100% gratuito.
**Motivo:** compra no app aciona as regras de In-App Purchase da Apple (comissão, StoreKit, telas de
restauração) e a revisão fica mais rigorosa. Sem modelo de monetização definido, isso é complexidade
sem retorno.
**Reversão:** v2 com RevenueCat. Exige tabela de assinaturas e gating de funcionalidade — decisão de
produto, não de arquitetura.

### D5 — Só PT-BR, com i18n já estruturado ✅

**Decisão:** todas as strings extraídas para `pt-BR.json` desde a Fase 1, mas só um idioma publicado.
**Motivo:** custo quase zero fazer certo desde o início; alto custo refatorar depois.
**Reversão:** adicionar `en.json` é ~2 dias de tradução por idioma.

### D6 — Prazo de 13 semanas, com plano de corte definido ✅

**Decisão:** cronograma completo de 13 semanas ([roadmap](./08-roadmap-e-fases.md)), com um caminho
curto de ~9 semanas já mapeado.
**Corte para 9 semanas (se precisar):** remover todos os itens 🟢 da
[matriz de priorização](./06-funcionalidades-e-user-stories.md#matriz-de-priorização) —
sai fotos de progresso, metas, gráficos avançados, exercício personalizado e favoritos.
Fica: auth + biblioteca + rotinas + **player completo** + histórico + dashboard básico.
**O que nunca cortar:** a Fase 4 (player). É o produto.

---

## 2. Decisões arquiteturais (ADRs)

### ADR-001 — Expo em vez de React Native CLI ✅

**Contexto:** app para iOS e Android, time pequeno, publicação nas duas lojas.
**Decisão:** Expo com development builds.
**Motivo:** EAS Build resolve assinatura e envio; OTA updates permitem hotfix sem passar pela loja;
config plugins evitam mexer em código nativo.
**Consequência:** dependência do ecossistema Expo e das janelas de atualização de SDK. Aceitável.
**Alternativa descartada:** RN CLI puro — mais controle, muito mais tempo de configuração e manutenção.

### ADR-002 — Supabase direto, sem backend intermediário ✅

**Contexto:** app precisa de auth, banco e storage; equipe pequena.
**Decisão:** app fala direto com o Supabase; segurança por RLS; lógica privilegiada em Edge Functions.
**Motivo:** elimina uma camada inteira de código e infraestrutura. RLS é mais confiável que checagem
em API própria, porque é imposta pelo banco.
**Consequência:** toda regra de acesso vira SQL. Exige disciplina e teste de RLS (previsto no [doc 10](./10-qualidade-testes-e-cicd.md#31-teste-de-rls-o-mais-importante)).
**Alternativa descartada:** API própria (NestJS/Fastify) — +4 semanas, sem ganho real nesta escala.

### ADR-003 — Denormalizar totais da sessão ✅

**Contexto:** dashboard e gráficos consultam volume o tempo todo.
**Decisão:** `total_volume_kg`, `total_sets` e `total_reps` gravados em `workout_sessions`,
mantidos por trigger.
**Motivo:** evita `SUM` sobre milhares de séries a cada abertura de tela.
**Consequência:** risco de divergência se o trigger falhar. Mitigado por teste de integração
e por uma query de reconciliação que pode ser rodada periodicamente.

### ADR-004 — Estado do treino no cliente, não no servidor ✅

**Contexto:** academia com sinal ruim; treino não pode parar.
**Decisão:** durante o treino, a fonte da verdade é o Zustand persistido em MMKV; o servidor recebe
por uma outbox idempotente.
**Motivo:** requisito de produto — o player precisa funcionar 100% offline.
**Consequência:** complexidade de sincronização. Mitigada por `client_id` único em todas as tabelas
de execução.

### ADR-005 — ENUMs do Postgres em vez de tabelas de domínio ✅

**Decisão:** enums nativos para valores fixos (status, tipo de série, etc.).
**Motivo:** integridade garantida pelo banco e geração automática de union types no TypeScript.
**Consequência:** adicionar valor exige migration (`ALTER TYPE ... ADD VALUE`). Aceitável, pois esses
domínios são estáveis.
**Exceção:** `muscle_groups` e `equipment` são **tabelas**, porque precisam de nome traduzido, cor,
ícone e ordenação.

### ADR-006 — NativeWind em vez de biblioteca de componentes pronta ✅

**Decisão:** NativeWind v4 + design system próprio.
**Motivo:** a identidade visual do app (especialmente o player) é bem específica; bibliotecas prontas
acabam sendo mais brigadas do que aproveitadas.
**Consequência:** ~1 semana construindo os primitivos (diluída nas fases 1–2).
**Alternativas descartadas:** Tamagui (mais performático, curva de aprendizado maior),
Gluestack (menos flexível para o visual desejado).

### ADR-007 — Uma tabela `exercises` para catálogo e customizados ✅

**Decisão:** exercícios do sistema (`created_by IS NULL`) e personalizados na mesma tabela.
**Motivo:** evita `UNION` em toda busca e simplifica as FKs de `workout_exercises` e `session_exercises`.
**Consequência:** a RLS precisa distinguir os dois casos — já previsto nas políticas.

### ADR-008 — Manter o histórico ao excluir uma rotina ✅

**Decisão:** `workout_sessions.plan_id` e `workout_day_id` usam `ON DELETE SET NULL`.
**Motivo:** o histórico é o ativo mais valioso do usuário. Apagar uma rotina antiga não pode destruir
meses de registro.
**Consequência:** sessões órfãs de plano. Tratado exibindo o nome que foi salvo no momento
(`workout_sessions.name` é um snapshot).

### ADR-009 — Maestro em vez de Detox para E2E ✅

**Decisão:** Maestro.
**Motivo:** YAML simples, sem build adicional, manutenção muito menor — decisivo para time pequeno.
**Consequência:** menos controle fino sobre sincronização. Suficiente para 5 fluxos críticos.

### ADR-010 — Banco sempre em unidade métrica ✅

**Decisão:** `weight_kg`, `height_cm`, `distance_m`. Conversão para lb/in **só** na camada de apresentação.
**Motivo:** unidade no banco é fonte infinita de bug. Com uma única unidade canônica, todo cálculo,
agregação e comparação é trivialmente correto.
**Consequência:** conversão em toda entrada e saída — encapsulada em `src/utils/units.ts`.

### ADR-011 — Catálogo de exercícios como seed versionado, não como migration ✅

**Decisão:** os 138 exercícios e os 5 templates ficam em `supabase/seed/`, fora das migrations.
**Motivo:** catálogo é **dado**, não estrutura. Colocar dado em migration significa que qualquer
correção de texto vira uma nova migration em produção. Como seed idempotente, dá para corrigir e
reaplicar à vontade.
**Consequência:** o seed precisa rodar manualmente nos ambientes remotos (`psql -f supabase/seed.sql`).
Localmente, `supabase db reset` já executa.

---

## 3. Premissas técnicas remanescentes

| # | Premissa | Se estiver errada |
|---|---|---|
| P1 | Sem integração com Apple Health / Google Fit | +1 semana e revisão extra nas lojas |
| P2 | Portrait apenas | Landscape exigiria revisar todos os layouts |
| P3 | iOS 16+ e Android 8+ (API 26) | Baixar o mínimo aumenta o custo de teste |
| P4 | Sem funcionalidade social (feed, seguir) | Se entrar, muda RLS e exige moderação de conteúdo |
| P5 | Sem suporte dedicado a tablet (`supportsTablet: false`) | Ativar exige screenshots de iPad e revisão de layout |
| P6 | 1 desenvolvedor full-time | Ver [D6](#d6--prazo-de-13-semanas-com-plano-de-corte-definido-) |
| P7 | Projeto Supabase atual vira **produção**; criar `dev` e `staging` | Sem ambientes separados, toda migration testa em produção |

---

## 4. Riscos do projeto

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | **Teste fechado obrigatório do Google Play atrasa o lançamento em 2 semanas** | 🔴 Alta | Alto | Começar o teste fechado já na Fase 7; recrutar 12+ testadores com antecedência |
| R2 | **Sincronização offline duplicando séries** | 🟡 Média | 🔴 Crítico | `client_id` + `upsert` idempotente + teste dedicado na Fase 7 |
| R3 | **Escopo crescer durante o desenvolvimento** | 🔴 Alta | Alto | Backlog v1.1/v2 já definido. Ideia nova vai para o backlog, não para a v1 |
| R4 | **Rejeição na App Store por exclusão de conta** | 🟡 Média | Alto | Implementado já na Fase 1 e testado no build de produção |
| R5 | **Player com performance ruim em Android intermediário** | 🟡 Média | Alto | Testar em aparelho real desde a Fase 4, não só no emulador |
| R6 | **Abertura da conta Apple/Google atrasa** | 🟡 Média | Alto | Abrir na Fase 6; D-U-N-S com 1 mês de antecedência se for PJ |
| R7 | **Timer de descanso não dispara em segundo plano no Android** | 🟡 Média | Alto | Notificação local agendada (não timer em JS) + teste com Doze mode |
| R8 | **Bundle ID errado / precisa mudar depois de publicar** | 🟢 Baixa | 🔴 Crítico | Definir [antes da Fase 0](#-o-único-item-que-falta-identidade-do-app) |
| R9 | **Limite do free tier do Supabase** | 🟢 Baixa | Médio | Monitorar uso; migrar para Pro antes do lançamento público |
| R10 | **Trigger de PR degradar a performance com muitos dados** | 🟢 Baixa | Médio | Índices previstos; monitorar `pg_stat_statements` |
| R11 | **Regras das lojas mudarem** | 🟡 Média | Médio | Reconfirmar requisitos no Console no momento do envio ([doc 09](./09-publicacao-nas-lojas.md)) |
| R12 | **App sem mídia parecer "vazio" para o usuário** | 🟡 Média | Baixo | Ícone colorido do grupo muscular + instruções escritas; licenciar mídia na v1.1 ([D3](#d3--mídia-dos-exercícios)) |

### Os três riscos que mais merecem atenção

1. **R1 (teste fechado do Google Play)** — é um bloqueio de calendário, não técnico. Começar cedo é a única saída.
2. **R2 (duplicação offline)** — silencioso e destrutivo: corrompe o histórico e mina a confiança no app.
3. **R3 (crescimento de escopo)** — a causa mais comum de app que nunca é publicado.

---

## 5. Pontos de decisão adiados (não bloqueiam nada)

Estes ficam para o momento em que forem realmente necessários — decidir agora seria decidir no escuro.

| Item | Quando decidir | Opções |
|---|---|---|
| Ferramenta de analytics | Fase 6 | PostHog (open source, self-host) · Firebase Analytics (grátis) · nenhum na v1 |
| Provedor de SMTP | Fase 1 | Resend (mais simples) · SendGrid · Amazon SES (mais barato em escala) |
| Hospedagem da política de privacidade | Fase 8 | GitHub Pages (grátis) · Vercel · site próprio |
| Fornecedor da mídia dos exercícios | v1.1 | Pacote licenciado · produção própria · geração por IA |
| Modelo de assinatura | v2 | RevenueCat (recomendado) · StoreKit + Play Billing direto |
| Tradução para inglês | v1.2 | Tradução profissional · IA + revisão |
| Suporte a tablet | v1.2 | Exige screenshots extras e revisão de layout |

---

## 6. Estado do plano

| Item do planejamento | Status |
|---|---|
| Escopo e visão de produto | ✅ Fechado |
| Modelo de dados (19 tabelas, 18 enums, 3 views, 10 funções) | ✅ Fechado |
| SQL das migrations (14 arquivos) | ✅ Escrito |
| Políticas RLS de todas as tabelas | ✅ Escrito |
| Seed do catálogo (138 exercícios) | ✅ **Escrito e versionado** |
| Seed dos templates (5 rotinas) | ✅ **Escrito e versionado** |
| Mapa de telas (42) | ✅ Fechado |
| User stories (41) e regras de negócio (13) | ✅ Fechado |
| Design system e tokens | ✅ Fechado |
| Roadmap em 10 fases | ✅ Fechado |
| Processo de publicação nas lojas | ✅ Fechado |
| Estratégia de testes e CI/CD | ✅ Fechado |
| Decisões de produto | ✅ Fechadas (D1–D6) |
| Decisões arquiteturais | ✅ Fechadas (ADR-001 a ADR-011) |
| **Identidade do app (nome + bundle ID)** | 🔴 **Depende de você** |

### Próximo passo

Com o nome e o bundle ID definidos, a Fase 0 roda inteira:

```bash
cd "/Users/leonardoscapinello/Desktop/Aplicativo Mobile" && npx create-expo-app@latest . --template default
```

Depois: estrutura de pastas, NativeWind com os tokens, 14 migrations, RLS, buckets, seed dos 138
exercícios e 5 templates, tipos gerados e app rodando nos dois SOs. Ver
[Fase 0](./08-roadmap-e-fases.md#fase-0--fundação-e-infraestrutura).

---

## 7. Registro de mudanças deste plano

| Data | Mudança | Motivo |
|---|---|---|
| 13/08/2026 | Versão inicial do plano completo (12 documentos) | Criação do projeto |
| 14/08/2026 | Catálogo de exercícios expandido de 20 para **138** e escrito em `supabase/seed/02_exercises.sql` | Fechamento do plano |
| 14/08/2026 | **5 templates de treino** escritos em `supabase/seed/03_templates.sql` | Fechamento do plano |
| 14/08/2026 | Questões Q1–Q6 convertidas em decisões fechadas (D1–D6) | Fechamento do plano |
| 14/08/2026 | Adicionado ADR-011 (catálogo como seed, não migration) | Fechamento do plano |
| 14/08/2026 | Criado `docs/PROGRESS.md` para rastrear a execução | Fechamento do plano |

> Manter esta tabela atualizada. Toda decisão que mudar o rumo do projeto deve virar uma linha aqui
> e, se for arquitetural, um ADR na [seção 2](#2-decisões-arquiteturais-adrs).

---

[← Qualidade e CI/CD](./10-qualidade-testes-e-cicd.md) · [Índice](./README.md)
