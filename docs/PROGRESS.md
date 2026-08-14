# 📊 Progresso da Execução

[← Voltar ao índice](./README.md)

> Rastreador vivo do projeto. Atualizar ao fim de cada fase — o que entregou, o que ficou
> pendente e o que mudou de rumo. O plano em si fica nos documentos numerados; **aqui fica a realidade.**

**Última atualização:** 14/08/2026 · **Fase atual:** ✅ Fase 0 concluída — pronta para a Fase 1

---

## Visão geral

```
Planejamento  ██████████████████████████████  100%  ✅ Concluído
Fase 0        ██████████████████████████████  100%  ✅ Concluída
Fase 1        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Próxima
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
| 0 — Fundação | ✅ **Concluída** | 14/08/26 | 14/08/26 | Expo SDK 57 + banco aplicado e validado |
| 1 — Auth e perfil | ⏳ Próxima | — | — | |
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
| 14 migrations (schema, triggers, RPCs, RLS, storage) | ✅ **Aplicadas em produção** | `supabase/migrations/` |
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
| Tela de verificação da Fase 0 | ✅ (substituir na Fase 1) |

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
| Build nativo iOS/Android local | ❌ Máquina sem Xcode e sem Android SDK | Verificação feita via web (mesmo bundle Metro). Resolver antes da Fase 4 |
| Ambientes `dev` e `staging` no Supabase | ❌ Só existe o projeto atual | Migrations estão sendo aplicadas direto no projeto de produção |
| Sentry | ⬜ Adiado para a Fase 7 | Nenhum — não há usuários ainda |
| Husky + lint-staged + Commitlint | ⬜ Adiado | Baixo |

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
