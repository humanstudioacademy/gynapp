# 📊 Progresso da Execução

[← Voltar ao índice](./README.md)

> Rastreador vivo do projeto. Atualizar ao fim de cada fase — o que entregou, o que ficou
> pendente e o que mudou de rumo. O plano em si fica nos documentos numerados; **aqui fica a realidade.**

**Última atualização:** 14/08/2026 · **Fase atual:** Planejamento concluído, aguardando início da Fase 0

---

## Visão geral

```
Planejamento  ██████████████████████████████  100%  ✅ Concluído
Fase 0        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Aguardando identidade do app
Fase 1        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 2        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 3        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 4 ⭐     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 5        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 6        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 7        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 8        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
Fase 9        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%
```

| Fase | Status | Início | Fim | Observações |
|---|---|---|---|---|
| Planejamento | ✅ Concluída | 13/08/26 | 14/08/26 | 13 documentos + seeds do banco |
| 0 — Fundação | ⏳ Bloqueada | — | — | Depende do nome + bundle ID |
| 1 — Auth e perfil | ⬜ | — | — | |
| 2 — Exercícios | ⬜ | — | — | Catálogo já seedado; falta só a UI |
| 3 — Rotinas | ⬜ | — | — | Templates já seedados |
| 4 — Player ⭐ | ⬜ | — | — | **Fase crítica — não reduzir prazo** |
| 5 — Progresso | ⬜ | — | — | |
| 6 — Corpo e metas | ⬜ | — | — | Abrir contas Apple/Google nesta fase |
| 7 — Polimento | ⬜ | — | — | Iniciar teste fechado do Play aqui |
| 8 — Beta | ⬜ | — | — | |
| 9 — Publicação | ⬜ | — | — | |

---

## Artefatos já entregues

### Documentação (13 arquivos em `docs/`)

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
| [11 — Decisões](./11-decisoes-e-pendencias.md) | ✅ |

### Banco de dados (`supabase/`)

| Artefato | Status | Onde |
|---|---|---|
| 14 migrations (schema, triggers, RPCs, RLS, storage) | 📝 SQL escrito no doc 03/04 — falta virar arquivo | [doc 03](./03-migrations-e-sql.md) |
| Seed de grupos musculares e equipamentos | ✅ **Arquivo pronto** | `supabase/seed/01_catalog.sql` |
| Seed de 138 exercícios + músculos secundários | ✅ **Arquivo pronto** | `supabase/seed/02_exercises.sql` |
| Seed de 5 templates de treino | ✅ **Arquivo pronto** | `supabase/seed/03_templates.sql` |
| Orquestrador do seed com validação | ✅ **Arquivo pronto** | `supabase/seed.sql` |

### Código do app

Nada ainda — começa na Fase 0.

---

## Checklist da Fase 0 (próxima)

Ver [detalhamento completo](./08-roadmap-e-fases.md#fase-0--fundação-e-infraestrutura).

**Pré-requisito:** nome do app + bundle ID definidos.

- [ ] Projeto Expo criado com TypeScript e Expo Router
- [ ] Git inicializado com `.gitignore` correto
- [ ] Estrutura de pastas do [doc 01](./01-arquitetura-tecnica.md#3-estrutura-de-pastas)
- [ ] ESLint + Prettier + Husky + lint-staged + Commitlint
- [ ] NativeWind com os tokens do [doc 07](./07-design-system-e-ux.md#2-tokens-de-design)
- [ ] `app.config.ts` com os 3 ambientes
- [ ] `.env.example` versionado, `.env` ignorado
- [ ] Projetos Supabase `dev` e `staging` criados
- [ ] Supabase CLI linkado, rodando local
- [ ] 14 migrations aplicadas
- [ ] Políticas RLS aplicadas
- [ ] Buckets de Storage criados
- [ ] Seed executado (validar: 14 grupos · 12 equipamentos · 138 exercícios · 5 templates)
- [ ] `database.types.ts` gerado
- [ ] Cliente Supabase com SecureStore
- [ ] TanStack Query + persister
- [ ] Development build rodando em iOS **e** Android
- [ ] EAS configurado
- [ ] Sentry instalado

**Critério de saída:** `npm run typecheck`, `npm run lint` e `supabase db reset` passam limpos, e o app
abre nos dois SOs consultando os grupos musculares do seed.

---

## Registro de decisões tomadas durante a execução

> Registrar aqui toda decisão que desviar do plano, com o motivo. Se for arquitetural, criar também
> um ADR no [doc 11](./11-decisoes-e-pendencias.md#2-decisões-arquiteturais-adrs).

| Data | Fase | Decisão | Motivo |
|---|---|---|---|
| — | — | — | — |

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
| 1 | 1,5 sem | — | — | 11 | — |
| 2 | 1 sem | — | — | 3 | — |
| 3 | 1,5 sem | — | — | 7 | — |
| 4 | 2 sem | — | — | 5 | — |
| 5 | 1,5 sem | — | — | 5 | — |
| 6 | 1 sem | — | — | 7 | — |
| 7 | 1 sem | — | — | 0 | — |
| 8 | 1,5 sem | — | — | 0 | — |
| 9 | 1 sem | — | — | 0 | — |

---

[← Índice](./README.md)
