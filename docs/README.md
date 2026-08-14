# 📱 GymApp — Plano de Desenvolvimento

> Aplicativo mobile (iOS + Android) de acompanhamento de treinos de academia.
> Stack: **Expo (React Native + TypeScript)** + **Supabase (Postgres + Auth + Storage)**.
> Escopo v1: **área do aluno**.

**Status:** ✅ Fases 0 e 2 concluídas · 🟡 Fase 1 aguardando SMTP próprio e rate limits do Auth (ver [PROGRESS](./PROGRESS.md))

---

## 🗂 Índice da documentação

| # | Documento | O que contém |
|---|-----------|--------------|
| 00 | [Visão Geral e Escopo](./00-visao-geral.md) | Produto, público, objetivos, escopo dentro/fora, glossário |
| 01 | [Arquitetura Técnica](./01-arquitetura-tecnica.md) | Stack, bibliotecas, estrutura de pastas, ambientes, camadas |
| 02 | [Modelo de Dados](./02-modelo-de-dados.md) | Diagrama ER, todas as tabelas, campos, relacionamentos, enums |
| 03 | [Migrations e SQL](./03-migrations-e-sql.md) | SQL completo, ordem das migrations, índices, triggers, RPCs, seeds |
| 04 | [Segurança, Auth e RLS](./04-seguranca-rls-e-auth.md) | Fluxo de autenticação, políticas RLS, Storage, LGPD |
| 05 | [Mapa de Telas e Navegação](./05-mapa-de-telas.md) | Todas as telas, rotas do Expo Router, wireframes, estados |
| 06 | [Funcionalidades e User Stories](./06-funcionalidades-e-user-stories.md) | Épicos, histórias, critérios de aceite, regras de negócio |
| 07 | [Design System e UX](./07-design-system-e-ux.md) | Tokens, componentes, tipografia, cores, acessibilidade |
| 08 | [Roadmap e Fases](./08-roadmap-e-fases.md) | 10 fases, entregáveis, estimativas, checklists, dependências |
| 09 | [Publicação nas Lojas](./09-publicacao-nas-lojas.md) | EAS Build/Submit, App Store, Google Play, assets, compliance |
| 10 | [Qualidade, Testes e CI/CD](./10-qualidade-testes-e-cicd.md) | Estratégia de testes, lint, GitHub Actions, observabilidade |
| 11 | [Decisões e Pendências](./11-decisoes-e-pendencias.md) | ADRs, decisões fechadas, riscos, o que ainda depende de você |
| 📊 | [**PROGRESS**](./PROGRESS.md) | Rastreador vivo da execução — atualizar a cada fase |

## 🗄 Artefatos de banco já escritos

| Arquivo | Conteúdo |
|---|---|
| `supabase/seed.sql` | Orquestrador do seed, com validação das contagens |
| `supabase/seed/01_catalog.sql` | 14 grupos musculares + 12 equipamentos |
| `supabase/seed/02_exercises.sql` | **138 exercícios** com instruções de execução |
| `supabase/seed/03_templates.sql` | **5 rotinas prontas** com fichas e exercícios prescritos |

---

## ⚡ Resumo executivo

**O que é:** app onde o aluno monta (ou escolhe) suas rotinas de treino, executa o treino
dentro do app com cronômetro de descanso, registra cada série (carga × repetições) e
acompanha sua evolução por gráficos, recordes pessoais e medidas corporais.

**Números do plano:**

| Métrica | Valor |
|---|---|
| Tabelas no banco | **19** + 3 views + 8 funções (RPC) |
| Telas | **42** (auth, tabs, modais e fluxos) |
| Épicos funcionais | **11**, com 41 user stories |
| Exercícios no catálogo | **138** (já escritos e versionados) |
| Rotinas prontas | **5** templates do sistema |
| Fases de desenvolvimento | **10** (Fase 0 → Fase 9) |
| Estimativa total | **~13 semanas** para 1 dev full-time · caminho curto de 9 semanas mapeado |
| Buckets de Storage | 3 (`avatars`, `exercise-media`, `progress-photos`) |

**Diferenciais que o plano já contempla desde o dia 1:**

- ✅ Funciona **offline** durante o treino (academia tem sinal ruim) — fila de sincronização
- ✅ **Recordes pessoais (PRs)** calculados automaticamente por trigger no banco
- ✅ **RLS em 100% das tabelas** — nenhum aluno enxerga dado de outro
- ✅ **Exclusão de conta in-app** — requisito obrigatório da Apple (Guideline 5.1.1(v))
- ✅ Modelo de dados já preparado para o **módulo de personal trainer** na v2 sem migration destrutiva
- ✅ Acessibilidade, tema claro/escuro e suporte a métrico/imperial

---

## 🚀 Como usar esta documentação

1. **Leia primeiro** os documentos `00` e `01` para alinhar produto e stack.
2. **Responda** o único item aberto em [`11-decisoes-e-pendencias.md`](./11-decisoes-e-pendencias.md#-o-único-item-que-falta-identidade-do-app) — nome e bundle ID.
3. **Execute** seguindo o [`08-roadmap-e-fases.md`](./08-roadmap-e-fases.md), que tem checklist por fase.
4. **Atualize** o [`PROGRESS.md`](./PROGRESS.md) ao fim de cada fase.

---

## 📍 Status atual

| Etapa | Status |
|---|---|
| Planejamento (13 documentos) | ✅ **Concluído** |
| Seeds do banco (catálogo + templates) | ✅ **Escritos e versionados** |
| Decisões de produto (D1–D8) e arquitetura (ADR-001 a 011) | ✅ **Fechadas** |
| Nome do app e bundle ID | 🟡 `ai.thehuman.gymapp` provisório — alterável até a 1ª submissão |
| Fase 0 — Fundação | ✅ **Concluída** |
| Fase 1 — Auth e perfil | 🟡 **Código pronto e verificado** — faltam SMTP e rate limits |
| Fase 2 — Biblioteca de exercícios | ✅ **Concluída** |
| Fases 3–9 | ⬜ Não iniciadas |

---

_Última atualização: 14/08/2026_
