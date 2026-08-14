# GymApp

Aplicativo mobile (iOS + Android) de acompanhamento de treinos de academia. O aluno monta a
própria rotina ou escolhe uma pronta, executa o treino dentro do app com cronômetro de descanso,
registra cada série e acompanha a evolução por gráficos e recordes pessoais.

**Stack:** Expo (React Native + TypeScript) · Expo Router · NativeWind · TanStack Query ·
Supabase (Postgres + Auth + Storage).

## Como rodar

```bash
npm install
cp .env.example .env   # preencha com as chaves do seu projeto Supabase
npm run start:go       # Expo Go
```

Para o banco (usa psql via Docker, não exige psql instalado):

```bash
npm run db:migrate     # aplica as migrations
npm run db:seed        # carrega catálogo e templates
npm run types:gen      # regenera src/lib/supabase/database.types.ts
```

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `app/` | Rotas do Expo Router — grupos `(auth)`, `onboarding`, `(app)` e `(modals)` |
| `src/features/` | Domínio: `auth`, `onboarding`, `profile`, `exercises`, `catalog` |
| `src/components/ui/` | Primitivos do design system |
| `src/theme/` | Tokens de cor, espaçamento e tipografia — fonte única de verdade |
| `supabase/migrations/` | Schema, triggers, RPCs e políticas de RLS |
| `supabase/seed/` | 138 exercícios e 5 rotinas prontas |
| `docs/` | Planejamento completo — 14 documentos |

## Documentação

O plano inteiro está em [`docs/`](./docs/README.md): modelo de dados, políticas de RLS, mapa das
telas, design system, roadmap por fases e o rastreador de execução em
[`docs/PROGRESS.md`](./docs/PROGRESS.md).

## Segurança

O app fala direto com o Supabase, sem backend próprio — então **toda** a autorização vive no banco,
via Row Level Security em 100% das tabelas. A chave publicável fica embutida no binário por design;
a chave secreta e a senha do banco nunca entram no repositório. Ver
[`docs/04-seguranca-rls-e-auth.md`](./docs/04-seguranca-rls-e-auth.md).
