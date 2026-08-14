# 00 — Visão Geral e Escopo

[← Voltar ao índice](./README.md)

---

## 1. O produto em uma frase

> Um app de academia onde o aluno **monta seu treino, executa dentro do app e vê sua evolução ao longo do tempo**.

## 2. Problema que resolve

| Dor do aluno | Como o app resolve |
|---|---|
| Anota treino em papel / bloco de notas e perde o histórico | Histórico permanente na nuvem, sincronizado entre dispositivos |
| Não lembra qual carga usou da última vez | Cada exercício mostra a **última performance** direto na tela de execução |
| Não sabe se está evoluindo | Gráficos de volume, carga máxima e 1RM estimado por exercício |
| Perde tempo cronometrando descanso no relógio | Timer de descanso automático com notificação e vibração |
| Esquece a ordem/série do treino do dia | Ficha do dia guiada, passo a passo |
| Internet ruim na academia | Funciona 100% offline durante o treino e sincroniza depois |

## 3. Público-alvo (v1)

**Persona primária — "Aluno frequentador"**
- 18–45 anos, treina 3–5x por semana em academia
- Já tem alguma noção de treino (ou recebeu ficha do professor)
- Quer registrar o que fez e ver progresso
- Usa Android (mercado BR ~75%) ou iPhone
- **Não quer complexidade**: precisa registrar uma série em ≤ 2 toques

**Persona secundária — "Iniciante"**
- Nunca treinou, precisa de rotinas prontas e vídeos/instruções de execução
- Atendida pelos **templates de treino** e pela biblioteca de exercícios com instruções

## 4. Objetivos do produto

### Objetivos de negócio
1. Publicar na App Store e Google Play com uma v1 sólida e sem rejeições
2. Base para monetização futura (assinatura premium) — arquitetura já prevê, feature fica na v2
3. Base para o módulo de personal trainer (v2) sem refazer o banco

### Métricas de sucesso (definir baseline após lançamento)
| Métrica | Meta v1 |
|---|---|
| Crash-free sessions | ≥ 99,5% |
| Tempo até registrar a 1ª série (novo usuário) | ≤ 3 min desde a instalação |
| Retenção D7 | ≥ 30% |
| Treinos registrados por usuário ativo/semana | ≥ 2,5 |
| Tempo de abertura (cold start) | ≤ 2,5s |

## 5. Escopo

### ✅ Dentro do escopo (v1 — área do aluno)

| Área | Itens |
|---|---|
| **Conta** | Cadastro com e-mail/senha, login, recuperação de senha, verificação de e-mail, logout, editar perfil, **excluir conta** |
| **Onboarding** | Coleta de nome, data de nascimento, sexo, altura, peso, objetivo, nível, frequência semanal |
| **Exercícios** | Biblioteca com catálogo pré-carregado (**138 exercícios** já escritos em `supabase/seed/`), busca, filtros (grupo muscular, equipamento), detalhe com instruções passo a passo, criar exercício personalizado, favoritar |
| **Rotinas** | Criar/editar/duplicar/arquivar rotina, organizar em dias (Treino A/B/C), adicionar exercícios com séries/reps/carga/descanso alvo, reordenar (drag), bi-set/tri-set, escolher entre templates prontos |
| **Execução** | Player de treino: lista de séries, marcar série concluída, editar carga/reps na hora, timer de descanso automático, adicionar/remover série, trocar exercício, notas, pausar/retomar, cancelar, finalizar |
| **Pós-treino** | Tela de resumo: duração, volume total, séries, PRs conquistados, sensação percebida |
| **Progresso** | Histórico de sessões, detalhe de sessão passada, gráficos (volume semanal, volume por grupo muscular, evolução por exercício, peso corporal), lista de recordes pessoais, calendário de treinos, streak |
| **Corpo** | Registro de peso e medidas corporais, fotos de progresso (privadas) |
| **Metas** | Meta de treinos por semana, meta de peso corporal, meta de carga em um exercício |
| **Sistema** | Tema claro/escuro/automático, unidades kg/lb, idioma PT-BR (estrutura pronta para EN), notificações de lembrete de treino, offline-first no player |

### ❌ Fora do escopo da v1 (backlog v2+)

| Item | Por quê fica fora | Preparação já feita na v1 |
|---|---|---|
| Área do personal/professor | Escopo definido como "só aluno agora" | Campos `created_by`, `source`, `coach_id` já previstos no modelo |
| Login social (Google/Apple) | Só e-mail/senha foi pedido | ⚠️ Se entrar, **Sign in with Apple passa a ser obrigatório** na App Store |
| Assinatura / pagamentos (RevenueCat) | Sem modelo de monetização definido | Nenhuma — decisão de v2 |
| Feed social / seguir amigos | Aumenta muito o escopo e o compliance | — |
| Integração com Apple Health / Google Fit | Complexidade de permissões e revisão de loja | — |
| Wearables (Apple Watch / Wear OS) | Projeto separado | — |
| Nutrição / dieta | Produto diferente | — |
| Cardio com GPS | Produto diferente | `tracking_type` já suporta distância/tempo |
| Chat com professor | v2 junto do módulo de coach | — |
| Web app | Foco mobile | Supabase já serve qualquer cliente |

## 6. Plataformas suportadas

| Plataforma | Versão mínima | Observação |
|---|---|---|
| iOS | 16.0+ | Cobre >95% dos iPhones ativos |
| Android | 8.0 (API 26)+ | `targetSdk` sempre no exigido pela Play Store no momento do envio |
| Tablet | Suporte básico (layout responsivo) | Não é foco; App Store exige screenshots de iPad **apenas se** declarar suporte |
| Orientação | Portrait apenas na v1 | Simplifica testes e layout |

## 7. Glossário (vocabulário do domínio)

Termos padronizados para código, banco e UI — **usar sempre estes nomes**.

| PT-BR (UI) | EN (código/banco) | Definição |
|---|---|---|
| Rotina / Plano | `workout_plan` | Programa completo. Ex: "Treino ABC — Hipertrofia" |
| Ficha / Dia de treino | `workout_day` | Um dia dentro da rotina. Ex: "Treino A — Peito e Tríceps" |
| Exercício prescrito | `workout_exercise` | O exercício **planejado** dentro da ficha, com metas de séries/reps |
| Exercício (catálogo) | `exercise` | A definição do movimento. Ex: "Supino Reto com Barra" |
| Sessão / Treino realizado | `workout_session` | A execução real, com data/hora de início e fim |
| Exercício da sessão | `session_exercise` | O exercício efetivamente executado naquela sessão |
| Série | `session_set` | Uma série executada: carga × repetições |
| Recorde pessoal (PR) | `personal_record` | Melhor marca do aluno em um exercício |
| Volume | `volume` | Σ (carga × repetições) — em kg |
| 1RM estimado | `estimated_1rm` | Carga máxima teórica para 1 repetição (fórmula de Epley) |
| Descanso | `rest` | Intervalo entre séries |
| Grupo muscular | `muscle_group` | Peito, costas, pernas, etc. |
| Equipamento | `equipment` | Barra, halter, máquina, peso corporal, cabo, etc. |
| Medidas corporais | `body_measurement` | Peso, % gordura, circunferências |
| Sequência / Ofensiva | `streak` | Semanas consecutivas batendo a meta de treinos |
| Bi-set / Tri-set | `superset_group` | Exercícios executados em sequência sem descanso |

## 8. Decisões de produto fechadas

Justificativa e caminho de reversão de cada uma em [`11-decisoes-e-pendencias.md`](./11-decisoes-e-pendencias.md#1-decisões-de-produto-fechadas).

| # | Decisão | Custo de reverter depois |
|---|---|---|
| D1 | O aluno **monta a própria rotina** ou copia um dos 5 templates prontos | Baixo — `coach_id` e `source='coach'` já existem no schema |
| D2 | Autenticação **apenas e-mail + senha** | Baixo — adicionar provedor no Supabase é configuração. ⚠️ Login social obriga Sign in with Apple |
| D3 | **138 exercícios** com instruções escritas, **sem GIF de execução** na v1 | Baixo — `thumbnail_path` já existe; adicionar mídia é `UPDATE` + upload, sem migration |
| D4 | App **gratuito, sem anúncios e sem compras** na v1 | Médio — assinatura exige RevenueCat e gating na v2 |
| D5 | Idioma **PT-BR**, com i18n estruturado desde a Fase 1 | Baixo — ~2 dias por idioma novo |
| D6 | **13 semanas** de cronograma, com corte para 9 semanas já mapeado | — |
| D7 | Unidade canônica **kg/cm** no banco; lb/in só na apresentação | Alto se mudar — por isso está fechado |
| D8 | Sem backend próprio: **Supabase direto do app** + Edge Functions | Alto — decisão estrutural (ADR-002) |

> 🔴 **Único item ainda em aberto:** nome do app e bundle ID — o bundle ID não pode ser alterado
> depois de publicado. Ver [detalhe](./11-decisoes-e-pendencias.md#-o-único-item-que-falta-identidade-do-app).

---

[← Índice](./README.md) · [Próximo: Arquitetura Técnica →](./01-arquitetura-tecnica.md)
