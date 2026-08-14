# 07 — Design System e UX

[← Voltar ao índice](./README.md)

---

## 1. Princípios de design

| Princípio | O que significa na prática |
|---|---|
| **Mão suada, pressa e uma mão só** | O usuário está na academia, com pressa e às vezes com a mão suada. Alvos de toque grandes, ações principais na metade inferior da tela |
| **Menos toques vence** | Registrar uma série = 1 toque. Iniciar um treino = 2 toques a partir da abertura do app |
| **Mostre o contexto, não peça** | O app já sabe a última carga usada — mostra e pré-preenche, em vez de perguntar |
| **Escuro por padrão** | Academia costuma ser ambiente escuro; tema escuro reduz ofuscamento e economiza bateria em OLED |
| **Celebre o progresso** | PR, streak e metas alcançadas merecem animação e destaque — é o que traz o usuário de volta |
| **Nunca perca o dado do usuário** | Otimista sempre, offline sempre, confirmação antes de qualquer destruição |

---

## 2. Tokens de design

### 2.1 Cores

```ts
// src/theme/tokens.ts
export const palette = {
  // Marca — verde energia
  brand: {
    50:'#ECFDF5', 100:'#D1FAE5', 200:'#A7F3D0', 300:'#6EE7B7', 400:'#34D399',
    500:'#22C55E', 600:'#16A34A', 700:'#15803D', 800:'#166534', 900:'#14532D',
  },
  // Neutros — base do tema escuro
  neutral: {
    0:'#FFFFFF',  50:'#FAFAFA', 100:'#F4F4F5', 200:'#E4E4E7', 300:'#D4D4D8',
    400:'#A1A1AA', 500:'#71717A', 600:'#52525B', 700:'#3F3F46', 800:'#27272A',
    900:'#18181B', 950:'#0B0B0F',
  },
  // Semânticos
  success:'#22C55E', warning:'#F59E0B', danger:'#EF4444', info:'#3B82F6',
  // Acentos de dado (gráficos, PR, grupos musculares)
  accent: { pr:'#FBBF24', volume:'#8B5CF6', streak:'#F97316' },
} as const;

export const light = {
  bg:            palette.neutral[50],
  bgElevated:    palette.neutral[0],
  bgSubtle:      palette.neutral[100],
  border:        palette.neutral[200],
  text:          palette.neutral[900],
  textSecondary: palette.neutral[500],
  textInverse:   palette.neutral[0],
  primary:       palette.brand[600],
  primaryText:   palette.neutral[0],
} as const;

export const dark = {
  bg:            palette.neutral[950],
  bgElevated:    palette.neutral[900],
  bgSubtle:      palette.neutral[800],
  border:        palette.neutral[800],
  text:          palette.neutral[50],
  textSecondary: palette.neutral[400],
  textInverse:   palette.neutral[950],
  primary:       palette.brand[500],
  primaryText:   palette.neutral[950],
} as const;
```

**Uso semântico obrigatório** — nunca usar hex direto no componente:

| Papel | Token | Exemplo de uso |
|---|---|---|
| Ação primária | `primary` | Botão "Iniciar treino", série concluída |
| Sucesso / PR | `success` / `accent.pr` | Checkbox marcado, badge de recorde |
| Perigo | `danger` | Excluir, cancelar treino |
| Aviso | `warning` | Banner de offline |
| Volume (gráficos) | `accent.volume` | Barras de volume |
| Streak | `accent.streak` | Ícone de fogo |

### 2.2 Tipografia

Fonte: **Inter** (variável), via `expo-font`. Fallback para a fonte do sistema.

| Estilo | Tamanho | Peso | Line-height | Uso |
|---|---|---|---|---|
| `display` | 32 | 700 | 40 | Números grandes do resumo (volume, duração) |
| `h1` | 28 | 700 | 36 | Título de tela |
| `h2` | 22 | 600 | 28 | Seção |
| `h3` | 18 | 600 | 24 | Card, nome de exercício |
| `body` | 16 | 400 | 24 | Texto padrão |
| `bodyMedium` | 16 | 500 | 24 | Texto com ênfase |
| `caption` | 14 | 400 | 20 | Texto secundário |
| `label` | 13 | 500 | 16 | Rótulo de campo, cabeçalho de tabela |
| `micro` | 11 | 500 | 14 | Badge, contador |
| `numeric` | 18 | 600 | 24 | **Tabular** — kg e reps (evita "pulo" de largura ao mudar o número) |

> `fontVariant: ['tabular-nums']` é **obrigatório** em qualquer número que muda em tempo real
> (cronômetro, timer, carga). Sem isso o layout treme.

### 2.3 Espaçamento (escala de 4pt)

| Token | px | Uso |
|---|---|---|
| `xs` | 4 | Entre ícone e texto |
| `sm` | 8 | Interno de badge, gap pequeno |
| `md` | 12 | Padding de item de lista |
| `lg` | 16 | **Padding padrão da tela** |
| `xl` | 24 | Entre seções |
| `2xl` | 32 | Respiro de topo |
| `3xl` | 48 | Estados vazios |

### 2.4 Raios e elevação

| Token | Valor | Uso |
|---|---|---|
| `radius.sm` | 8 | Chip, badge |
| `radius.md` | 12 | Input, botão |
| `radius.lg` | 16 | Card |
| `radius.xl` | 24 | Bottom sheet, modal |
| `radius.full` | 999 | Avatar, pill |

Elevação: sombra sutil no tema claro; no tema escuro usar **diferença de background** (`bgElevated`)
em vez de sombra — sombra em fundo preto não aparece.

### 2.5 Animação

| Interação | Duração | Curva |
|---|---|---|
| Toque em botão (escala 0.97) | 100ms | `ease-out` |
| Transição entre telas | 250ms | `ease-in-out` |
| Bottom sheet | 300ms | spring (damping 20) |
| Marcar série (check) | 200ms | spring |
| Celebração de PR | 800ms | spring + confete |
| Skeleton shimmer | 1200ms | loop linear |

> Respeitar `AccessibilityInfo.isReduceMotionEnabled()` — com "reduzir movimento" ativo,
> trocar animação por fade simples.

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

### 3.2 Componentes de domínio

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
| `StatTile` | Dashboard, resumo | Número grande + rótulo |
| `VolumeChart` | Dashboard, progresso | Barras de volume por semana |
| `ProgressLineChart` | Exercício, peso | Linha temporal |
| `MuscleDistribution` | Progresso | Barras horizontais por grupo muscular |
| `FrequencyHeatmap` | Progresso | Grade estilo GitHub |
| `CalendarStrip` | Dashboard | Semana atual com dias treinados marcados |
| `MeasurementRow` | Medidas | Campo com unidade e delta em relação à medição anterior |

### 3.3 Exemplo de implementação — `Button`

```tsx
// src/components/ui/Button.tsx
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary:   'bg-brand-500 active:bg-brand-600',
  secondary: 'bg-neutral-800 active:bg-neutral-700',
  ghost:     'bg-transparent',
  danger:    'bg-danger active:opacity-90',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-10 px-4',
  md: 'h-12 px-5',
  lg: 'h-14 px-6',   // ← altura mínima confortável para o CTA principal
};

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon, haptic = true, fullWidth = false,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={style} className={fullWidth ? 'w-full' : undefined}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => {
          if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        className={`flex-row items-center justify-center gap-2 rounded-xl
                    ${variantClasses[variant]} ${sizeClasses[size]}
                    ${isDisabled ? 'opacity-50' : ''}`}
      >
        {loading ? <ActivityIndicator size="small" /> : (
          <>
            {icon && <View>{icon}</View>}
            <Text className="text-base font-semibold text-white">{title}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
```

---

## 4. Regras de layout

| Regra | Valor |
|---|---|
| Padding horizontal da tela | 16pt |
| Altura mínima de alvo de toque | **44pt** (iOS HIG) / 48dp (Material) |
| Altura do botão primário (CTA) | 56pt |
| Altura de linha de lista | ≥ 56pt |
| Altura da tab bar | 56pt + safe area inferior |
| Altura do header | 56pt + safe area superior |
| Largura máxima de conteúdo em tablet | 600pt centralizado |
| Distância mínima entre alvos de toque | 8pt |

**Zona do polegar:** ações primárias sempre no terço inferior da tela. Ações destrutivas nunca perto
de ações frequentes (evita toque acidental ao suar).

---

## 5. Acessibilidade — requisitos

| Requisito | Como validar |
|---|---|
| Contraste ≥ 4.5:1 (texto normal) e 3:1 (texto grande) | Checar tokens no Contrast Checker |
| Todo controle tem `accessibilityLabel` e `accessibilityRole` | Lint + revisão |
| `accessibilityState` reflete selecionado/desabilitado/ocupado | Revisão |
| Layout suporta fonte até 200% | Testar com Dynamic Type no máximo |
| Não depender só de cor | Série concluída tem check **e** cor |
| Foco de leitor de tela segue a ordem visual | VoiceOver / TalkBack |
| Reduzir movimento respeitado | `AccessibilityInfo` |
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

---

## 7. Assets necessários

| Asset | Tamanho | Formato | Observação |
|---|---|---|---|
| Ícone do app | 1024×1024 | PNG sem transparência | Base para todos os tamanhos |
| Ícone adaptativo Android | 1024×1024 (foreground) | PNG com transparência | Conteúdo na área segura central de 66% |
| Splash | 1284×2778 | PNG | Fundo `#0B0B0F` |
| Ícone de notificação Android | 96×96 | PNG branco sobre transparente | Android exige silhueta |
| Ilustrações de estado vazio | SVG | 6 variações | Sem rotina, sem histórico, sem exercício, sem medida, sem meta, offline |
| Mídia dos exercícios | 600×600 | WebP / GIF | 138 itens — **fora da v1** (ver abaixo) |
| Sons | — | MP3 curto | `rest-end.mp3`, `pr-achieved.mp3` |
| Screenshots das lojas | ver [doc 09](./09-publicacao-nas-lojas.md) | PNG | 6–8 por plataforma |

### Exercícios sem imagem — o fallback

A v1 lança **sem GIFs de execução** ([decisão D3](./11-decisoes-e-pendencias.md#d3--mídia-dos-exercícios)).
Onde não há mídia, a UI mostra um bloco quadrado com a **cor do grupo muscular** (`muscle_groups.color_hex`)
e o ícone do equipamento. Isso vale para `ExerciseListItem`, `ExerciseCard` e o cabeçalho do detalhe.

```tsx
// src/components/exercise/ExerciseThumb.tsx
export function ExerciseThumb({ exercise, size = 48 }: Props) {
  if (exercise.thumbnailUrl) {
    return <Image source={exercise.thumbnailUrl} style={{ width: size, height: size }}
                  className="rounded-lg" contentFit="cover" />;
  }
  return (
    <View
      style={{ width: size, height: size, backgroundColor: `${exercise.muscleGroup.colorHex}22` }}
      className="items-center justify-center rounded-lg"
      accessibilityLabel={`${exercise.muscleGroup.namePt}, ${exercise.equipment?.namePt ?? 'sem equipamento'}`}
    >
      <EquipmentIcon slug={exercise.equipment?.slug} size={size * 0.5}
                     color={exercise.muscleGroup.colorHex} />
    </View>
  );
}
```

O resultado é consistente e colorido — a lista não parece quebrada, e as **instruções escritas**
(que já vêm no seed dos 138 exercícios) cobrem a necessidade real de quem está treinando.
Quando as imagens forem licenciadas, basta preencher `thumbnail_path` — o componente passa a
usá-las sem nenhuma mudança de código.

---

## 8. Suporte a temas

- Padrão: **escuro**. `userInterfaceStyle: 'automatic'` no `app.config.ts`.
- Preferência do usuário (`user_settings.theme`) sobrescreve o do sistema.
- Todo componente lê cor do `ThemeProvider` — **zero hex hardcoded**.
- Testar as duas telas críticas (player e dashboard) nos dois temas antes de fechar cada fase.

---

[← Funcionalidades](./06-funcionalidades-e-user-stories.md) · [Índice](./README.md) · [Próximo: Roadmap →](./08-roadmap-e-fases.md)
