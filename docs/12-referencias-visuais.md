# 12 — Referências Visuais e Decisões de Adaptação

[← Voltar ao índice](./README.md)

Origem da linguagem visual da [v2 do design system](./07-design-system-e-ux.md). Este documento
existe para responder três perguntas: **o que pegamos**, **o que adaptamos** e — o mais importante —
**o que deliberadamente não pegamos, e por quê**.

---

## 1. O que as referências têm em comum

Nove peças de UI fitness/finanças analisadas. O denominador comum é consistente:

| Traço | Como aparece |
|---|---|
| Fundo quase preto | `#0A0A0A`–`#121212`, cards um degrau acima |
| Um único acento ácido | Lima/verde-limão em ~5% da área da tela |
| Preenchimento claro + texto escuro | O CTA é lima com letra preta — nunca lima com letra branca |
| Raios generosos | Cards 20–28, pills 999 |
| Números heróicos | 40–56pt, unidade em cinza pequeno ao lado |
| Anéis e arcos | Progresso quase sempre circular, não linear |
| Navegação em pill | Segmented arredondado; filtros como chips roláveis |
| FAB central | `+` elevado no meio da tab bar |
| Capa com scrim | Imagem + gradiente + título + chips de metadado |

Isso virou a seção 2 da doc 07 — com a diferença de que **medimos os contrastes** antes de adotar.
A medição revelou a regra dura do sistema: branco sobre lima dá **1.16:1** e é proibido.

---

## 2. Referência → nosso padrão

| O que a referência faz | Como vira nosso | Custo |
|---|---|---|
| Anel "Daily Activity" com passos/calorias/água | `RingStat` da **meta semanal de treinos** (`2/3`) | Zero — `get_dashboard_summary()` já devolve |
| Medidor semicircular de passos | `GaugeArc` de **volume da semana vs. meta** | Zero — `v_weekly_volume` |
| Grade de cards "Credit Age / Total Accounts" | `BentoGrid` de `MetricTile` no dashboard | Zero |
| Card de treino com capa, `45 min`, `Hard` | `HeroCard` + `MetaChip` na ficha e no template | Baixo — duração estimada e nível derivam do que já existe |
| Linha `Filtros · Ordenar · Buscar` | `FilterBar` na biblioteca e no histórico | Baixo — busca e filtros já existem (Fase 2) |
| Tela cheia lima "Get ready" | `GetReadyOverlay` com 3-2-1 antes da 1ª série | Baixo |
| Número gigante `10` sobre a foto do exercício | `RepCounter` no **modo foco** do player | Médio |
| Modal lima "Congratulation" | `CelebrationSheet` para PR e treino concluído | Baixo — celebração de PR já estava no plano |
| Faixa de check-in de 7 dias | `StreakStrip` no dashboard | Zero — US-6.4 (streak) já planejada |
| Fundo gradiente mesh | `AuroraBackground` só em boas-vindas/onboarding | Baixo |
| Tab bar com `+` central | `TabBarFab` com sheet de ação rápida | Médio — muda a navegação global |

---

## 3. O que **não** vamos pegar

Esta é a parte que importa. Várias referências são de apps com modelo de dados e de negócio
diferentes do nosso. Copiar a tela sem ter o dado atrás produz UI vazia.

| Elemento da referência | Decisão | Motivo |
|---|---|---|
| **Passos, calorias, batimentos, água** | ❌ Fora da v1 | Não temos esses dados. Exigiria HealthKit + Health Connect, permissões novas nas lojas e uma tela de consentimento. Ver §4.3 |
| **Perfis de treinador, notas e avaliações** | ❌ Fora do produto | É um marketplace de dois lados. Nosso app é um registro pessoal de treino — não há oferta a avaliar |
| **Moedas, "watch ads", resgate de recompensas** | ❌ Fora do produto | Anúncio e moeda virtual mudam a proposta e criam obrigações de disclosure nas lojas. A motivação vem de streak, PR e metas — que já temos |
| **Vídeo de execução em tela cheia** | ⏸ Adiado | Depende de licenciar 138 mídias ([D3](./11-decisoes-e-pendencias.md#d3--mídia-dos-exercícios)). O `RepCounter` funciona sobre o bloco de cor do grupo muscular |
| **Fotografia das referências** | ❌ Nunca | São imagens de terceiros, com pessoas identificáveis e crédito de outros designers. Nenhuma entra no produto |

> A linguagem (cor, raio, ritmo, hierarquia) é o que se aproveita de uma referência.
> Layout específico, arte e fotografia, não.

---

## 4. Aprimoramentos que nasceram da análise

Cada item abaixo virou user story na [doc 06](./06-funcionalidades-e-user-stories.md), Épico 12.

### 4.1 Aproveitam dado que já existe — entram na v1

| # | Aprimoramento | Por que vale |
|---|---|---|
| 1 | **Anel de meta semanal** no topo do dashboard | Hoje o dashboard mostra `2/3 treinos` como texto. Como anel, vira a primeira coisa que o olho pega e responde "estou em dia?" em 200ms |
| 2 | **Progresso da ficha como anel no player** | O usuário sabe quanto falta sem contar séries. `8/18` já é calculado |
| 3 | **`StreakStrip` de 7 dias** | Streak já estava planejada como número. Como faixa, mostra *quais* dias — e o buraco de ontem incomoda mais que um contador |
| 4 | **Duração estimada na ficha** | `Σ (séries × (tempo de execução + descanso))`. Todos os campos existem em `workout_exercises`. Responde "tenho tempo pra isso hoje?" |
| 5 | **`MetaChip`s no card da ficha** | Grupos musculares da ficha + nível da rotina, ambos já no banco. Transforma uma lista cinza em cards escaneáveis |
| 6 | **Modo foco no player** | Um exercício por vez, número gigante, Anterior/Próximo. Opcional — o modo lista continua padrão para quem registra carga |
| 7 | **Sheet de ação rápida no FAB** | Hoje "registrar medida" está a 3 toques do Progresso. Passa a 2 de qualquer tela |
| 8 | **`CelebrationSheet` unificado** | PR, treino concluído e meta batida usam o mesmo componente lima. Um padrão em vez de três |

### 4.2 Precisam de dado novo — v1.1

| # | Aprimoramento | O que falta |
|---|---|---|
| 9 | **Metas por grupo muscular** ("2× peito/semana") | Nova coluna em `user_goals` (tipo `muscle_frequency`) |
| 10 | **Conquistas** (sem moeda) | Tabela `achievements` + `user_achievements`. Deriva de dados que já temos: nº de treinos, streak, PRs, volume acumulado |

### 4.3 Integração com saúde — v1.2, decisão em aberto

Passos/calorias/frequência cardíaca só fazem sentido lidos do HealthKit (iOS) e Health Connect
(Android). Implicações: permissão nova, tela de consentimento, política de privacidade atualizada,
e revisão mais rigorosa na App Store. **Recomendação: não fazer na v1.** Registrado como pendência
em [11 — Decisões](./11-decisoes-e-pendencias.md).

---

## 5. Checklist antes de aprovar qualquer tela nova

1. O acento lima ocupa menos de ~10% da tela?
2. Todo preenchimento lima tem texto `neutral-950`? (nunca branco)
3. O número é maior que o rótulo?
4. Os raios estão em 20/28, não em 8/12?
5. A tela funciona sem nenhuma fotografia?
6. Existe estado de loading, vazio, erro e offline?
7. Passa em fonte 200% e com "reduzir movimento" ativo?

---

[← Decisões e pendências](./11-decisoes-e-pendencias.md) · [Índice](./README.md) · [Design System →](./07-design-system-e-ux.md)
