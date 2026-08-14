# 07 — Design System e UX

[← Voltar ao índice](./README.md)

> **v2 — "Lima sobre tinta".** Esta versão substitui o verde esmeralda por uma linguagem
> de lima ácido sobre preto esverdeado, com superfícies arredondadas, anéis de progresso e
> números heróicos. A origem visual está em [12 — Referências visuais](./12-referencias-visuais.md).
> Os contrastes citados aqui foram **medidos** (WCAG 2.1), não estimados.

---

## 1. Princípios de design

| Princípio | O que significa na prática |
|---|---|
| **Mão suada, pressa e uma mão só** | O usuário está na academia, com pressa e às vezes com a mão suada. Alvos de toque grandes, ações principais na metade inferior da tela |
| **Menos toques vence** | Registrar uma série = 1 toque. Iniciar um treino = 2 toques a partir da abertura do app |
| **Mostre o contexto, não peça** | O app já sabe a última carga usada — mostra e pré-preenche, em vez de perguntar |
| **Escuro por padrão** | Academia costuma ser ambiente escuro; tema escuro reduz ofuscamento e economiza bateria em OLED |
| **O número é o herói** 🆕 | Carga, volume, reps e duração são o conteúdo. Número grande e tabular; rótulo pequeno e secundário. Nunca o inverso |
| **Uma cor de ação** 🆕 | O lima significa *uma* coisa: "aqui é a ação / aqui está o seu progresso". Se tudo é lima, nada é |
| **Celebre o progresso** | PR, streak e metas alcançadas merecem animação e destaque — é o que traz o usuário de volta |
| **Nunca perca o dado do usuário** | Otimista sempre, offline sempre, confirmação antes de qualquer destruição |

---

## 2. Tokens de design

Fonte de verdade: [`src/theme/tokens.ts`](../src/theme/tokens.ts), espelhada em
[`tailwind.config.js`](../tailwind.config.js). **Zero hex em componente.**

### 2.1 Cores

```ts
export const palette = {
  // Lima ácido — a assinatura
  brand: {
    50:'#F4FFE0', 100:'#E9FFC0', 200:'#DEFF96', 300:'#DBFF6B', 400:'#D2FF3A',
    500:'#C2F224', 600:'#A3CC1F', 700:'#7A991A', 800:'#4F6610', 900:'#2E3B0A',
  },
  // Neutros levemente esverdeados — preto puro vibra ao lado do lima
  neutral: {
    0:'#FFFFFF',  50:'#F5F7F2', 100:'#E8EBE4', 200:'#CFD4C9', 300:'#A8B0A2',
    400:'#767C72', 500:'#565B53', 600:'#3D423B', 700:'#2F332C', 800:'#21251F',
    900:'#161915', 950:'#0A0B0A',
  },
  success:'#7AE582', warning:'#FFC53D', danger:'#FF5C5C', info:'#4FC3F7',
  accent: { pr:'#FFC53D', volume:'#D2FF3A', streak:'#FF7A2F', series:'#A78BFA', rest:'#4FC3F7' },
} as const;
```

#### ⚠️ A regra que sustenta o sistema

O lima é uma cor **clara**. Isso tem uma consequência dura e não negociável:

| Combinação | Contraste medido | Veredito |
|---|---|---|
| `neutral-950` sobre `brand-400` (CTA) | **17.0:1** | ✅ AAA — **é assim que se usa lima** |
| `brand-400` como texto sobre `neutral-950` | **17.0:1** | ✅ AAA |
| `brand-400` como texto sobre card `neutral-900` | **15.29:1** | ✅ AAA |
| `brand-800` como texto sobre branco | **6.48:1** | ✅ AA — único passo que passa no tema claro |
| `brand-600` como texto sobre branco | **1.87:1** | ❌ **Proibido** |
| **branco sobre `brand-400`** | **1.16:1** | ❌ **Proibido — nunca, em hipótese alguma** |

> **Lima nunca recebe texto branco.** Preenchimento lima → texto `neutral-950`.
> Lima como texto em fundo claro → `brand-800` (token `accentText`).
> Isso já está codificado: `primaryText` e `accentText` em `tokens.ts` resolvem por tema.

#### Uso semântico obrigatório

| Papel | Token | Exemplo de uso |
|---|---|---|
| Ação primária | `primary` + `primaryText` | Botão "Iniciar treino", série concluída, chip selecionado |
| Lima como texto/link | `accentText` | "Criar agora", valor em destaque |
| Sucesso / PR | `success` / `accent.pr` | Checkbox marcado, badge de recorde |
| Perigo | `danger` | Excluir, cancelar treino |
| Aviso | `warning` | Banner de offline |
| Volume (gráficos) | `accent.volume` | Barras e anéis de volume |
| Streak | `accent.streak` | Ícone de fogo, faixa de sequência |
| Descanso | `accent.rest` | Timer, barra de descanso |
| Trilho de progresso | `track` | Fundo de anel e barra |

Séries de gráfico com N linhas usam `dataSeries` na ordem — todas ≥ 6.5:1 sobre o fundo escuro.

#### Contrastes de texto verificados

| Par | Medido | Exigido |
|---|---|---|
| `neutral-50` sobre `neutral-950` | 18.28:1 | 4.5 ✅ |
| `neutral-300` (secundário) sobre `neutral-950` | 8.82:1 | 4.5 ✅ |
| `neutral-300` (secundário) sobre card `neutral-900` | 7.94:1 | 4.5 ✅ |
| `neutral-400` (terciário) sobre `neutral-950` | 4.60:1 | 3 ✅ |
| `neutral-900` sobre `neutral-50` (claro) | 16.44:1 | 4.5 ✅ |
| `neutral-500` (secundário claro) sobre `neutral-50` | 6.45:1 | 4.5 ✅ |

> No tema claro os semânticos usam variantes escurecidas (`danger-ink`, `warning-ink`,
> `success-ink`) — os tons do tema escuro reprovam em fundo branco.

### 2.2 Tipografia

Fonte: **Inter** (variável), via `expo-font`. Fallback para a fonte do sistema.

| Estilo | Tamanho | Peso | LH | Tracking | Uso |
|---|---|---|---|---|---|
| `metricXl` 🆕 | 56 | 700 | 60 | −1.5 | Contador de reps no player, número herói de tela cheia |
| `metric` 🆕 | 40 | 700 | 44 | −1 | Número principal de card (volume, duração, % da meta) |
| `display` | 32 | 700 | 40 | −0.5 | Números grandes do resumo |
| `h1` | 28 | 700 | 36 | −0.4 | Título de tela |
| `h2` | 22 | 600 | 28 | — | Seção |
| `h3` | 18 | 600 | 24 | — | Card, nome de exercício |
| `body` | 16 | 400 | 24 | — | Texto padrão |
| `bodyMedium` | 16 | 500 | 24 | — | Texto com ênfase |
| `caption` | 14 | 400 | 20 | — | Texto secundário |
| `label` | 13 | 500 | 16 | — | Rótulo de campo |
| `micro` | 11 | 500 | 14 | — | Badge, contador |
| `overline` 🆕 | 11 | 600 | 14 | +1.2 | **CAIXA ALTA** acima de cada bloco do dashboard |

**Regra do par número+unidade** 🆕 — a unidade nunca compete com o número:

```
11.240        ← metric, text (neutral-50)
/ 16.000 kg   ← caption, textTertiary
```

> `fontVariant: ['tabular-nums']` é **obrigatório** em qualquer número que muda em tempo real
> (cronômetro, timer, carga, contador de reps). Sem isso o layout treme.

### 2.3 Espaçamento (escala de 4pt)

| Token | px | Uso |
|---|---|---|
| `xs` | 4 | Entre ícone e texto |
| `sm` | 8 | Interno de badge, gap pequeno |
| `md` | 12 | Padding de item de lista, **gap entre cards do bento** |
| `lg` | 16 | **Padding padrão da tela e interno do card** |
| `xl` | 24 | Entre seções |
| `2xl` | 32 | Respiro de topo |
| `3xl` | 48 | Estados vazios |

### 2.4 Raios e elevação

Os raios subiram — a linguagem depende disso. Um card a 20 lê como "superfície";
o mesmo card a 12 lê como "caixa".

| Token | Valor | Uso |
|---|---|---|
| `radius.sm` | 10 | Chip pequeno, badge, thumb |
| `radius.md` | 14 | Input, botão pequeno |
| `radius.lg` | **20** | **Card padrão** |
| `radius.xl` | **28** | Card de destaque, CTA grande, hero |
| `radius.2xl` | **36** | Bottom sheet, modal, overlay de tela cheia |
| `radius.full` | 999 | Avatar, pill, chip de filtro, FAB |

**Elevação no tema escuro = degrau de superfície, não sombra.** Sombra em fundo preto não
aparece. A escada é `bg` → `bgElevated` → `bgSubtle`:

| Camada | Token | Separação medida |
|---|---|---|
| Fundo da tela | `neutral-950` | — |
| Card | `neutral-900` | 1.11:1 vs. fundo — visível como camada, invisível como cor |
| Preenchimento dentro do card (input, linha de série) | `neutral-800` | 1.14:1 vs. card |
| Borda | `neutral-800` | 1.27:1 vs. fundo |

No tema claro, elevação continua sendo sombra sutil + `bgElevated` branco.

### 2.5 Animação

| Interação | Duração | Curva |
|---|---|---|
| Toque em botão (escala 0.97) | 100ms | `ease-out` |
| Transição entre telas | 250ms | `ease-in-out` |
| Bottom sheet | spring | damping 20 · stiffness 180 |
| Marcar série (check) | spring | damping 14 · stiffness 220 |
| **Preenchimento de anel** 🆕 | 700ms | `ease-out`, sempre a partir do zero ao montar |
| **"Get ready" 3-2-1** 🆕 | 3× 1000ms | escala 1.2→1 + fade por dígito |
| Celebração de PR | 800ms | spring + confete |
| Skeleton shimmer | 1200ms | loop linear |

> Respeitar `AccessibilityInfo.isReduceMotionEnabled()` — com "reduzir movimento" ativo,
> anel aparece já preenchido, "get ready" vira um aviso estático de 1s, confete não roda.

---

## 3. Biblioteca de componentes

### 3.1 Primitivos (`src/components/ui/`)

| Componente | Variantes | Estados |
|---|---|---|
| `Button` | primary · secondary · ghost · danger · sizes sm/md/lg | default · pressed · disabled · loading |
| `Input` | text · numeric · password · search | default · focused · error · disabled |
| `NumberStepper` | — | Campo numérico com botões +/−, passo configurável |
| `Card` | flat · elevated · interactive | — |
| `Sheet` | — | Bottom sheet com snap points |
| `Badge` | neutral · success · warning · danger · pr | — |
| `Chip` | filter (selecionável) · tag | selected · unselected |
| `Avatar` | sizes xs/sm/md/lg | com imagem · com iniciais |
| `Skeleton` | text · circle · rect | — |
| `EmptyState` | — | Ícone + título + descrição + ação |
| `ErrorState` | — | Mensagem + "Tentar novamente" |
| `Toast` | success · error · info | — |
| `SegmentedControl` | — | Seletor de 2–4 opções |
| `ProgressBar` | linear · circular | — |
| `Switch` | — | — |
| `Screen` | — | Wrapper com SafeArea, scroll e padding padrão |

### 3.2 Novos primitivos da v2 🆕

| Componente | Descrição | Onde entra |
|---|---|---|
| `RingStat` | Anel de progresso com número no centro e rótulo abaixo. Tamanhos sm 48 / md 96 / lg 160, stroke 5/8/12 | Meta semanal, % da ficha concluída, progresso da meta |
| `GaugeArc` | Arco aberto de 240° com valor e alvo | Volume da semana vs. meta, carga vs. PR |
| `MetricTile` | Número grande + unidade pequena + rótulo `overline`. Opcional: ícone e delta colorido | Bento do dashboard, resumo pós-treino |
| `BentoGrid` | Grade 2×N de `MetricTile` com gap 12 | Dashboard, resumo, detalhe do exercício |
| `HeroCard` | Capa (imagem **ou** bloco na cor do grupo muscular) + scrim + título + `MetaChip`s | Ficha, template, exercício |
| `MetaChip` | Pill translúcido com ícone: `⏱ 45 min`, `🎯 Peito`, `📊 Intermediário` | Sobre `HeroCard` |
| `PillTabs` | Segmented em formato de pill, item ativo com preenchimento lima e texto tinta | Rotinas/Templates, Dia/Semana/Mês |
| `FilterBar` | Linha `⚙ Filtros · ↕ Ordenar · 🔍 Buscar` fixa abaixo do header | Biblioteca, histórico, templates |
| `TabBarFab` | Tab bar com botão `+` circular lima elevado no centro | Global (ver 4.3) |
| `StreakStrip` | 7 dias em linha, dia treinado com check lima, hoje com anel | Dashboard |
| `CelebrationSheet` | Sheet lima de altura média, check grande em círculo tinta, título e CTA | PR, treino concluído, meta batida |
| `AuroraBackground` | Gradiente mesh suave atrás do conteúdo (só boas-vindas e onboarding) | Auth/onboarding |

### 3.3 Componentes de domínio

| Componente | Onde é usado | Descrição |
|---|---|---|
| `SetRow` | Player | Linha da série: nº, anterior, kg, reps, checkbox. Swipe para excluir |
| `ExerciseCard` | Player, ficha | Card expansível com as séries dentro |
| `RestTimerBar` | Player | Barra fixa no rodapé com contagem regressiva |
| `SessionHeader` | Player | Cronômetro + progresso + menu |
| `ExerciseListItem` | Biblioteca, seletor | Thumb + nome + músculo + equipamento |
| `MuscleGroupFilter` | Biblioteca | Chips horizontais roláveis |
| `WorkoutDayCard` | Detalhe da rotina | Nome, nº de exercícios, duração estimada |
| `PlanCard` | Treinos | Capa, nome, nível, dias/semana |
| `PRBadge` | Resumo, exercício | Badge dourado com o valor e o ganho |
| `StatTile` | Dashboard, resumo | → substituído por `MetricTile` |
| `VolumeChart` | Dashboard, progresso | Barras de volume por semana |
| `ProgressLineChart` | Exercício, peso | Linha temporal |
| `MuscleDistribution` | Progresso | Barras horizontais por grupo muscular |
| `FrequencyHeatmap` | Progresso | Grade estilo GitHub |
| `CalendarStrip` | Dashboard | → substituído por `StreakStrip` |
| `MeasurementRow` | Medidas | Campo com unidade e delta em relação à medição anterior |
| `GetReadyOverlay` 🆕 | Player | Tela cheia lima, contagem 3-2-1 antes da primeira série |
| `RepCounter` 🆕 | Player (modo foco) | Número gigante sobre a mídia, com Anterior/Próximo |

### 3.4 Exemplo — `Button` com a regra do lima

```tsx
// src/components/ui/Button.tsx
const variantClass: Record<Variant, string> = {
  primary:   'bg-brand-400',                    // ← preenchimento lima
  secondary: 'bg-neutral-200 dark:bg-neutral-800',
  ghost:     'bg-transparent',
  danger:    'bg-danger',
};

const textClass: Record<Variant, string> = {
  primary:   'text-neutral-950',                // ← 17:1. NUNCA text-white aqui
  secondary: 'text-neutral-900 dark:text-neutral-50',
  ghost:     'text-brand-800 dark:text-brand-400',  // ← 6.48:1 claro / 17:1 escuro
  danger:    'text-white',
};
```

---

## 4. Regras de layout

### 4.1 Medidas

| Regra | Valor |
|---|---|
| Padding horizontal da tela | 16pt |
| Padding interno do card | 16pt |
| Gap entre cards do bento | 12pt |
| Altura mínima de alvo de toque | **44pt** (iOS HIG) / 48dp (Material) |
| Altura do botão primário (CTA) | 56pt |
| Altura de linha de lista | ≥ 56pt |
| Altura da tab bar | **64pt** + safe area inferior |
| Diâmetro do FAB central | 56pt |
| Altura do header | 56pt + safe area superior |
| Altura da capa em tela com herói | 260pt |
| Largura máxima de conteúdo em tablet | 600pt centralizado |
| Distância mínima entre alvos de toque | 8pt |

**Zona do polegar:** ações primárias sempre no terço inferior da tela. Ações destrutivas nunca perto
de ações frequentes (evita toque acidental ao suar).

### 4.2 Ritmo vertical da tela 🆕

Toda tela de conteúdo segue a mesma cadência:

```
Header (título + ação)
↓ 24
Bloco herói          ← card de destaque OU anel OU CTA principal
↓ 24
OVERLINE DA SEÇÃO
↓ 12
Conteúdo da seção
↓ 24
OVERLINE DA SEÇÃO
↓ 12
Conteúdo da seção
```

### 4.3 Tab bar com FAB central 🆕

Cinco posições, com o `+` elevado no centro:

```
🏠 Início   🏋️ Treinos   [ + ]   📈 Progresso   👤 Perfil
```

O `+` abre um sheet de ação rápida: **Iniciar treino livre · Nova rotina · Registrar medida ·
Nova foto de progresso**. Item ativo usa ícone e rótulo em lima; inativo em `textTertiary`.

> A tab bar continua oculta no player e em modais (regra da seção 8).

---

## 5. Acessibilidade — requisitos

| Requisito | Como validar |
|---|---|
| Contraste ≥ 4.5:1 (texto normal) e 3:1 (texto grande/UI) | **Tabelas da seção 2.1 — já medidas.** Reexecutar ao mudar qualquer token |
| Nenhum texto branco sobre lima | Revisão + busca por `text-white` junto de `bg-brand` |
| Todo controle tem `accessibilityLabel` e `accessibilityRole` | Lint + revisão |
| `accessibilityState` reflete selecionado/desabilitado/ocupado | Revisão |
| Layout suporta fonte até 200% | Testar com Dynamic Type no máximo — **atenção ao `metricXl`**, que deve encolher, não cortar |
| Não depender só de cor | Série concluída tem check **e** cor; anel tem número **e** arco |
| Anel de progresso anuncia valor | `accessibilityRole="progressbar"` + `accessibilityValue={{ min, max, now }}` |
| Foco de leitor de tela segue a ordem visual | VoiceOver / TalkBack |
| Reduzir movimento respeitado | `AccessibilityInfo` — ver seção 2.5 |
| Alvos ≥ 44×44pt | Revisão de design |
| Campos de formulário com label associado e erro anunciado | Testar com leitor |

**Fluxos que precisam passar em teste manual com leitor de tela:** cadastro, login, iniciar treino,
registrar série, finalizar treino.

---

## 6. Conteúdo e tom de voz

| Contexto | Como escrever | Exemplo |
|---|---|---|
| Tom geral | Direto, encorajador, sem gíria forçada | "Bora treinar?" ✅ · "Vamos detonar, guerreiro!" ❌ |
| Erros | O que houve + o que fazer, sem jargão | "Não foi possível conectar. Verifique sua internet e tente de novo." |
| Estados vazios | Explicar + oferecer ação | "Você ainda não registrou treinos. Que tal começar agora?" |
| Confirmação destrutiva | Deixar a consequência clara | "Excluir este treino? Os registros do histórico serão mantidos." |
| Celebração | Curta e específica | "Novo recorde! Supino Reto 77,5 kg 🎉" |
| Botões | Verbo no infinitivo | "Iniciar treino", "Salvar rotina" |
| `overline` de seção 🆕 | Substantivo curto, caixa alta, sem artigo | "ESTA SEMANA", "ÚLTIMOS RECORDES" |

**Nunca escrever:** "Erro 500", "null", "undefined", "Falha na requisição", nomes de tabela.

### Números e unidades

| Dado | Formato |
|---|---|
| Carga | `77,5 kg` — vírgula decimal, uma casa, sem `.0` |
| Volume | `4.850 kg` até 10t, depois `12,4 t` |
| Duração | `52 min`, `1h 12min` |
| Timer | `01:23` (mm:ss) |
| Data | `Hoje`, `Ontem`, `Seg, 12 ago` |
| Percentual | `+12%` com sinal e cor |
| Progresso de meta 🆕 | `2 / 3` — atual em `metric`, alvo em `caption` secundário |

---

## 7. Assets necessários

| Asset | Tamanho | Formato | Observação |
|---|---|---|---|
| Ícone do app | 1024×1024 | PNG sem transparência | Base para todos os tamanhos. **Lima sobre `#0A0B0A`** |
| Ícone adaptativo Android | 1024×1024 (foreground) | PNG com transparência | Conteúdo na área segura central de 66% |
| Splash | 1284×2778 | PNG | Fundo `#0A0B0A` |
| Ícone de notificação Android | 96×96 | PNG branco sobre transparente | Android exige silhueta |
| Ilustrações de estado vazio | SVG | 6 variações | Traço lima sobre transparente, peso 2pt |
| Mídia dos exercícios | 600×600 | WebP / GIF | 138 itens — **fora da v1** (ver abaixo) |
| Sons | — | MP3 curto | `rest-end.mp3`, `pr-achieved.mp3` |
| Screenshots das lojas | ver [doc 09](./09-publicacao-nas-lojas.md) | PNG | 6–8 por plataforma |

> **Fotografia:** as referências da doc 12 usam banco de imagens de terceiros. Nenhuma delas
> pode ir para o produto. A v1 não depende de foto — o sistema de capa por cor (abaixo)
> foi desenhado justamente para isso.

### Exercícios sem imagem — o fallback

A v1 lança **sem GIFs de execução** ([decisão D3](./11-decisoes-e-pendencias.md#d3--mídia-dos-exercícios)).
Onde não há mídia, a UI mostra um bloco com a **cor do grupo muscular** (`muscle_groups.color_hex`)
e o ícone do equipamento. Isso vale para `ExerciseListItem`, `ExerciseCard`, `HeroCard` e o
cabeçalho do detalhe.

```tsx
// src/components/exercise/ExerciseThumb.tsx
export function ExerciseThumb({ exercise, size = 48 }: Props) {
  if (exercise.thumbnailUrl) {
    return <Image source={exercise.thumbnailUrl} style={{ width: size, height: size }}
                  className="rounded-sm" contentFit="cover" />;
  }
  return (
    <View
      style={{ width: size, height: size, backgroundColor: `${exercise.muscleGroup.colorHex}22` }}
      className="items-center justify-center rounded-sm"
      accessibilityLabel={`${exercise.muscleGroup.namePt}, ${exercise.equipment?.namePt ?? 'sem equipamento'}`}
    >
      <EquipmentIcon slug={exercise.equipment?.slug} size={size * 0.5}
                     color={exercise.muscleGroup.colorHex} />
    </View>
  );
}
```

No `HeroCard` o mesmo bloco vira uma capa de 260pt com gradiente do `color_hex` para
`neutral-950`, e o título fica sobre o scrim. O resultado é consistente e colorido — a tela
não parece quebrada, e as **instruções escritas** (que já vêm no seed dos 138 exercícios)
cobrem a necessidade real de quem está treinando. Quando as imagens forem licenciadas, basta
preencher `thumbnail_path`.

---

## 8. Suporte a temas

- Padrão: **escuro**. `userInterfaceStyle: 'automatic'` no `app.config.ts`.
- Preferência do usuário (`user_settings.theme`) sobrescreve o do sistema.
- Todo componente lê cor do `ThemeProvider` — **zero hex hardcoded**.
- O tema claro **não é o escuro invertido**: lima vira `brand-800` como texto, semânticos usam
  as variantes `-ink`, e a elevação volta a ser sombra.
- Testar as duas telas críticas (player e dashboard) nos dois temas antes de fechar cada fase.

---

## 9. Migração da v1 para a v2

| Item | Status |
|---|---|
| `src/theme/tokens.ts` — paleta, raios, tipografia, `ring`, `motion` | ✅ Aplicado |
| `tailwind.config.js` — espelho dos tokens | ✅ Aplicado |
| `bg/border/text-brand-500` → `-brand-400` (27 tokens de classe) | ✅ Aplicado |
| `text-brand-600` → `text-brand-800` — corrige contraste de link no tema claro (6 tokens) | ✅ Aplicado |
| Total: **33 tokens de classe em 15 arquivos** | ✅ Aplicado |
| `typecheck` + `lint` limpos após a troca | ✅ Verificado |
| Novos primitivos da seção 3.2 | ⬜ Fase 3+ (ver [roadmap](./08-roadmap-e-fases.md)) |
| Tab bar com FAB central | ⬜ Fase 3 |
| Telas redesenhadas | ⬜ Ver [mapa de telas](./05-mapa-de-telas.md) |

---

[← Funcionalidades](./06-funcionalidades-e-user-stories.md) · [Índice](./README.md) · [Próximo: Roadmap →](./08-roadmap-e-fases.md)
