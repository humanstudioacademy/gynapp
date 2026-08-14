# 10 — Qualidade, Testes e CI/CD

[← Voltar ao índice](./README.md)

---

## 1. Estratégia de testes

Projeto de 1 dev não sustenta 90% de cobertura — e não precisa. A estratégia é **testar onde o erro
dói**, não em todo lugar.

```
        ╱╲          E2E (Maestro) — 5 fluxos críticos
       ╱──╲
      ╱────╲        Integração — hooks + Supabase local
     ╱──────╲
    ╱────────╲      Unitários — cálculos e regras de negócio
   ╱──────────╲
  ╱────────────╲    Tipos (TypeScript strict) — a base de tudo
```

### Onde investir, por prioridade

| Prioridade | O que testar | Por quê |
|---|---|---|
| 🔴 1 | **Cálculos** (`volume`, `1RM`, conversão de unidades, streak) | Erro silencioso que corrompe o histórico do usuário |
| 🔴 2 | **RLS** (isolamento entre usuários) | Vazamento de dado de saúde entre contas |
| 🔴 3 | **Sincronização offline** (idempotência) | Duplicar ou perder série destrói a confiança |
| 🟡 4 | **Fluxos E2E críticos** | Regressão que só aparece em produção |
| 🟡 5 | Hooks de dados | Contrato com o banco |
| 🟢 6 | Componentes de UI | Baixo retorno; cobrir só os primitivos |

---

## 2. Testes unitários

**Stack:** Jest + `jest-expo` + `@testing-library/react-native`

### Alvos obrigatórios

```ts
// src/utils/__tests__/calculations.test.ts
import { estimate1RM, sessionVolume, weeklyStreak } from '../calculations';

describe('estimate1RM (Epley)', () => {
  it('retorna a própria carga para 1 repetição', () => {
    expect(estimate1RM(100, 1)).toBe(100);
  });

  it('calcula corretamente para múltiplas repetições', () => {
    // 100 × (1 + 10/30) = 133.33
    expect(estimate1RM(100, 10)).toBeCloseTo(133.33, 2);
  });

  it('retorna null para entradas inválidas', () => {
    expect(estimate1RM(null, 10)).toBeNull();
    expect(estimate1RM(100, 0)).toBeNull();
  });

  it('não estima acima de 15 reps (fórmula perde precisão)', () => {
    expect(estimate1RM(60, 20)).toBeNull();
  });
});

describe('sessionVolume', () => {
  it('soma apenas séries concluídas', () => {
    const sets = [
      { weightKg: 80, reps: 10, isCompleted: true,  setType: 'normal' },
      { weightKg: 80, reps: 10, isCompleted: false, setType: 'normal' },
    ];
    expect(sessionVolume(sets)).toBe(800);
  });

  it('exclui séries de aquecimento', () => {
    const sets = [
      { weightKg: 40, reps: 15, isCompleted: true, setType: 'warmup' },
      { weightKg: 80, reps: 10, isCompleted: true, setType: 'normal' },
    ];
    expect(sessionVolume(sets)).toBe(800);
  });

  it('ignora séries sem carga (peso corporal)', () => {
    const sets = [{ weightKg: null, reps: 12, isCompleted: true, setType: 'normal' }];
    expect(sessionVolume(sets)).toBe(0);
  });
});
```

| Módulo | Casos mínimos |
|---|---|
| `calculations.ts` | 1RM, volume (com aquecimento, sem carga, série incompleta), streak, % de meta |
| `units.ts` | kg⇄lb e cm⇄in ida e volta sem perda; arredondamento correto |
| `format.ts` | Carga com vírgula, volume em toneladas, duração, datas relativas |
| `offline/outbox.ts` | Enfileirar, ordenar, deduplicar por `client_id`, limpar após sucesso |

**Meta de cobertura:** ≥ 90% em `src/utils/` e `src/lib/offline/`. Sem meta global.

---

## 3. Testes de integração

Rodam contra o **Supabase local** (`supabase start`), com banco resetado a cada suíte.

### 3.1 Teste de RLS (o mais importante)

```ts
// src/lib/supabase/__tests__/rls.test.ts
import { createClient } from '@supabase/supabase-js';

const url = 'http://localhost:54321';
const anon = process.env.SUPABASE_LOCAL_ANON_KEY!;

describe('Isolamento entre usuários (RLS)', () => {
  let clientA: ReturnType<typeof createClient>;
  let clientB: ReturnType<typeof createClient>;
  let sessionIdA: string;

  beforeAll(async () => {
    clientA = createClient(url, anon);
    clientB = createClient(url, anon);
    await clientA.auth.signUp({ email: 'a@test.com', password: 'Teste1234' });
    await clientB.auth.signUp({ email: 'b@test.com', password: 'Teste1234' });

    const { data } = await clientA
      .from('workout_sessions')
      .insert({ client_id: crypto.randomUUID(), name: 'Treino do A' })
      .select()
      .single();
    sessionIdA = data!.id;
  });

  it('B não enxerga as sessões de A', async () => {
    const { data } = await clientB.from('workout_sessions').select('*');
    expect(data).toEqual([]);
  });

  it('B não consegue ler a sessão de A pelo id', async () => {
    const { data } = await clientB.from('workout_sessions').select('*').eq('id', sessionIdA);
    expect(data).toEqual([]);
  });

  it('B não consegue alterar a sessão de A', async () => {
    const { data } = await clientB
      .from('workout_sessions')
      .update({ name: 'invadido' })
      .eq('id', sessionIdA)
      .select();
    expect(data).toEqual([]);
  });

  it('B não consegue apagar a sessão de A', async () => {
    await clientB.from('workout_sessions').delete().eq('id', sessionIdA);
    const { data } = await clientA.from('workout_sessions').select('*').eq('id', sessionIdA);
    expect(data).toHaveLength(1);
  });

  it('B não enxerga o perfil de A', async () => {
    const { data } = await clientB.from('profiles').select('*');
    expect(data).toHaveLength(1); // só o próprio
  });

  it('B não enxerga exercícios personalizados de A', async () => {
    await clientA.from('exercises').insert({
      name_pt: 'Meu exercício', primary_muscle_group_id: '<id>',
      created_by: '<uid-A>', is_public: false,
    });
    const { data } = await clientB.from('exercises').select('*').eq('name_pt', 'Meu exercício');
    expect(data).toEqual([]);
  });
});
```

**Repetir o padrão acima para:** `profiles`, `user_settings`, `session_sets`, `body_measurements`,
`progress_photos`, `personal_records`, `user_goals`, `workout_plans`.

### 3.2 Teste das RPCs

| Função | Casos |
|---|---|
| `start_workout_session` | Cria a sessão · pré-preenche todas as séries com as metas · é idempotente pelo `client_id` · falha se a ficha não existir |
| `finish_workout_session` | Remove séries não concluídas · calcula duração · retorna o volume correto · lista os PRs conquistados |
| `copy_plan_template` | Copia plano, fichas e exercícios · a cópia é editável · o original permanece intacto |
| `get_dashboard_summary` | Retorna contadores certos · streak calculado corretamente · retorna zerado para usuário novo |
| `delete_my_account` | Apaga todas as linhas do usuário em cascata |

### 3.3 Teste dos triggers

| Trigger | Casos |
|---|---|
| `handle_new_user` | Cadastro cria `profiles` **e** `user_settings` |
| `recalc_session_totals` | Inserir, atualizar e remover série atualiza os totais · aquecimento não conta |
| `check_personal_records` | Carga maior gera PR · carga menor **não** gera · `previous_value` preenchido · aquecimento não gera PR |

---

## 4. Testes E2E (Maestro)

**Por que Maestro e não Detox:** YAML simples, sem build extra, funciona bem com Expo, roda em CI e
localmente. Detox tem mais poder, mas custa muito mais manutenção para um time pequeno.

### Fluxos cobertos (5)

```yaml
# .maestro/01-signup-onboarding.yaml
appId: com.seudominio.gymapp.preview
---
- launchApp: { clearState: true }
- tapOn: "Criar conta"
- tapOn: { id: "input-name" }
- inputText: "Usuário de Teste"
- tapOn: { id: "input-email" }
- inputText: "teste-${maestro.timestamp}@gymapp.com"
- tapOn: { id: "input-password" }
- inputText: "Teste1234"
- tapOn: { id: "checkbox-terms" }
- tapOn: "Criar conta"
- assertVisible: "Verifique seu e-mail"
```

```yaml
# .maestro/03-log-workout.yaml   ← o fluxo mais crítico
appId: com.seudominio.gymapp.preview
---
- launchApp
- tapOn: "Iniciar treino"
- assertVisible: { id: "session-timer" }
- repeat:
    times: 4
    commands:
      - tapOn: { id: "set-checkbox-.*", index: 0 }
      - assertVisible: { id: "rest-timer" }
      - tapOn: "Pular"
- tapOn: "Finalizar treino"
- tapOn: "Finalizar"
- assertVisible: "TREINO CONCLUÍDO"
- assertVisible: { id: "stat-volume" }
```

| # | Fluxo | O que valida |
|---|---|---|
| 01 | Cadastro + onboarding | Conta nova chega ao dashboard |
| 02 | Login + logout | Sessão persiste e é limpa |
| 03 | **Registrar treino completo** | O caminho de maior valor do app |
| 04 | Criar rotina e ficha | CRUD de planejamento |
| 05 | Excluir conta | Requisito da App Store |

> **Regra:** todo componente interativo precisa de `testID` estável. Sem isso, o E2E vira caça ao texto
> e quebra a cada ajuste de copy.

---

## 5. Teste manual — roteiro de regressão

Rodar antes de **cada** build de produção. Em aparelho físico, iOS **e** Android.

### Auth
- [ ] Cadastrar com e-mail novo → recebe e-mail → confirma → entra
- [ ] Cadastrar com e-mail já usado → mensagem clara
- [ ] Entrar com senha errada → mensagem genérica
- [ ] Recuperar senha pelo deep link
- [ ] Fechar e reabrir → continua logado
- [ ] Sair → volta para boas-vindas e limpa o cache

### Treino (crítico)
- [ ] Iniciar treino a partir da ficha
- [ ] Última performance aparece em cada exercício
- [ ] Marcar série → haptic + timer inicia
- [ ] Editar carga de série já concluída
- [ ] Adicionar e remover série
- [ ] Adicionar exercício durante o treino
- [ ] Timer notifica com o app em segundo plano e com a tela bloqueada
- [ ] **Matar o app no meio do treino → reabrir → retoma tudo**
- [ ] **Modo avião durante o treino inteiro → volta a rede → sincroniza sem duplicar**
- [ ] Finalizar → resumo com volume e PRs corretos
- [ ] Cancelar treino pede confirmação

### Dados
- [ ] Treino registrado aparece no histórico e nos gráficos
- [ ] PR aparece na lista de recordes
- [ ] Nova medição corporal atualiza o gráfico de peso
- [ ] Foto de progresso não abre por URL sem autenticação

### Sistema
- [ ] Tema claro e escuro em todas as telas
- [ ] Trocar para imperial converte tudo
- [ ] Fonte do sistema em 200% não quebra layout
- [ ] Rotacionar o aparelho (deve travar em portrait)
- [ ] Notificação de lembrete dispara no horário
- [ ] Excluir conta apaga tudo

---

## 6. Ferramentas de qualidade estática

### ESLint — regras específicas do projeto

```js
// eslint.config.js (trecho relevante)
rules: {
  'no-console': ['error', { allow: ['warn', 'error'] }],
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  'react-hooks/exhaustive-deps': 'error',
  // Proíbe hex direto — cor só via token do tema
  'no-restricted-syntax': [
    'error',
    {
      selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
      message: 'Use os tokens do tema em vez de cor hexadecimal literal.',
    },
  ],
  // Proíbe importar o client do Supabase direto em telas
  'no-restricted-imports': [
    'error',
    {
      patterns: [{
        group: ['**/lib/supabase/client'],
        message: 'Acesse o Supabase pelos hooks de src/features/*, nunca direto na tela.',
      }],
    },
  ],
}
```

### TypeScript

```jsonc
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Git hooks

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

- `pre-commit` → lint-staged
- `pre-push` → `npm run typecheck && npm test`
- `commit-msg` → commitlint (Conventional Commits)

---

## 7. CI/CD — GitHub Actions

### `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
  push: { branches: [main, develop] }

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        with: { name: coverage, path: coverage/ }

  database:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: supabase db reset            # valida que as migrations aplicam do zero
      - run: supabase db lint             # detecta problema de schema
      - name: Verifica RLS em todas as tabelas
        run: |
          supabase db execute --sql "
            select tablename from pg_tables
            where schemaname='public' and rowsecurity=false;
          " | grep -q "0 rows" || (echo '❌ Tabela sem RLS!' && exit 1)
      - run: npm ci && npm run test:integration

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - name: Garante que nenhum segredo foi versionado
        run: |
          ! git grep -iE "service_role|SUPABASE_SERVICE" -- ':!docs/' ':!*.md'
```

### `.github/workflows/build.yml`

```yaml
name: Build
on:
  push: { branches: [main] }
  workflow_dispatch:
    inputs:
      profile:
        type: choice
        options: [preview, production]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --profile ${{ inputs.profile || 'preview' }} --platform all --non-interactive
```

### Estratégia de branches

```
main      ──●────────●────────●──   produção (protegida, só via PR)
             ╲      ╱        ╱
develop     ──●──●──●──●──●──●───   integração
                ╲  ╱  ╲  ╱
feature/*        ●──    ●──         trabalho do dia a dia
hotfix/*                    ●───    correção urgente direto de main
```

| Branch | Regra |
|---|---|
| `main` | Protegida. Merge só por PR com CI verde. Cada merge pode virar build de produção |
| `develop` | Integração. Builds de preview automáticos |
| `feature/*` | Uma feature por branch. PR para `develop` |
| `hotfix/*` | Sai de `main`, volta para `main` **e** `develop` |

---

## 8. Observabilidade

### Sentry

```ts
// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_APP_ENV,
  enabled: process.env.EXPO_PUBLIC_APP_ENV !== 'development',
  tracesSampleRate: 0.2,
  sendDefaultPii: false,          // ⚠️ nunca enviar PII em app de saúde
  beforeSend(event) {
    // remove e-mail e IP antes de enviar
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

**Alertas configurados:**

| Alerta | Condição | Ação |
|---|---|---|
| Crash rate | > 1% das sessões | Investigar imediatamente |
| Erro novo em produção | Primeira ocorrência | Notificação |
| Falha de sincronização | > 5% das tentativas | Investigar a outbox |
| Erro na finalização de treino | Qualquer ocorrência | 🔴 Crítico — é perda de dado do usuário |

### Métricas de produto a acompanhar

| Métrica | Meta | Onde |
|---|---|---|
| Crash-free sessions | ≥ 99,5% | Sentry |
| Cold start (p90) | ≤ 2,5s | Sentry Performance |
| Treinos registrados / usuário ativo / semana | ≥ 2,5 | Query no Supabase |
| Retenção D1 / D7 / D30 | 50% / 30% / 15% | Analytics |
| Taxa de conclusão do onboarding | ≥ 80% | Analytics |
| % de treinos iniciados que são finalizados | ≥ 85% | Query no Supabase |
| Tempo médio de registro de uma série | ≤ 5s | Analytics |

**Query de saúde do produto (rodar semanalmente):**

```sql
select
  date_trunc('week', started_at)::date as semana,
  count(distinct user_id)                             as usuarios_ativos,
  count(*) filter (where status = 'completed')        as treinos_concluidos,
  count(*) filter (where status = 'cancelled')        as treinos_cancelados,
  round(avg(duration_seconds) filter (where status = 'completed') / 60.0, 1) as duracao_media_min,
  round(avg(total_volume_kg)  filter (where status = 'completed'), 0)        as volume_medio_kg
from workout_sessions
where started_at >= now() - interval '12 weeks'
group by 1
order by 1 desc;
```

---

## 9. Gestão de bugs

| Severidade | Definição | Prazo |
|---|---|---|
| 🔴 **P0** | App não abre, perda de dados, vazamento entre usuários, não dá para treinar | Hotfix imediato (OTA se possível) |
| 🟠 **P1** | Funcionalidade principal quebrada, com contorno possível | Próximo release (≤ 1 semana) |
| 🟡 **P2** | Funcionalidade secundária, problema visual relevante | Próximo ciclo |
| 🟢 **P3** | Cosmético, melhoria | Backlog |

**Template de bug:**

```markdown
## O que aconteceu
## O que deveria acontecer
## Passos para reproduzir
1.
## Ambiente
- Aparelho / SO:
- Versão do app / build:
- Conta (não colocar senha):
## Evidência
(print, vídeo, link do Sentry)
## Severidade
P0 / P1 / P2 / P3
```

---

## 10. Checklist de qualidade por fase

Aplicar ao fim de **cada** fase do [roadmap](./08-roadmap-e-fases.md):

- [ ] `npm run lint` sem erro nem warning
- [ ] `npm run typecheck` limpo
- [ ] `npm test` verde
- [ ] Testado em iOS **e** Android físicos
- [ ] Temas claro e escuro conferidos
- [ ] Estados loading/empty/error de cada tela nova
- [ ] Sem `console.log` esquecido
- [ ] Sem string hardcoded fora do i18n
- [ ] `accessibilityLabel` nos controles novos
- [ ] `testID` nos elementos que o E2E usa
- [ ] Migrations novas aplicam em banco zerado
- [ ] Advisors do Supabase sem alerta crítico
- [ ] Documentação atualizada se algo mudou de rumo

---

[← Publicação](./09-publicacao-nas-lojas.md) · [Índice](./README.md) · [Próximo: Decisões e Pendências →](./11-decisoes-e-pendencias.md)
