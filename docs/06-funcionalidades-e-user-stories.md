# 06 — Funcionalidades e User Stories

[← Voltar ao índice](./README.md)

> Formato: **Como** [papel] **quero** [ação] **para** [benefício], seguido dos critérios de aceite.
> Prioridade: 🔴 P0 (sem isso não lança) · 🟡 P1 (importante) · 🟢 P2 (bom ter, pode cair)

---

## Épico 1 — Conta e Autenticação 🔴

### US-1.1 — Criar conta 🔴
**Como** visitante **quero** criar uma conta com e-mail e senha **para** salvar meus treinos na nuvem.

- [ ] Campos: nome, e-mail, senha, confirmar senha
- [ ] Senha: mínimo 8 caracteres, ao menos 1 letra e 1 número — indicador visual de força
- [ ] E-mail validado por regex e normalizado (minúsculas, sem espaços)
- [ ] Checkbox de aceite dos Termos e Política **não** vem pré-marcado; sem ele o botão fica desabilitado
- [ ] E-mail já cadastrado → mensagem clara com atalho para "Entrar"
- [ ] Após cadastro, envia e-mail de confirmação e vai para a tela de verificação
- [ ] `profiles` e `user_settings` são criados automaticamente (trigger)

### US-1.2 — Entrar 🔴
- [ ] Campos e-mail e senha, com botão mostrar/ocultar senha
- [ ] Erro genérico ("E-mail ou senha incorretos") — nunca revelar se o e-mail existe
- [ ] Sessão persistida em `expo-secure-store`; próxima abertura entra direto
- [ ] Após 5 tentativas erradas, aviso sobre o rate limit
- [ ] E-mail não confirmado → tela de verificação com opção de reenviar

### US-1.3 — Recuperar senha 🔴
- [ ] Informa o e-mail e recebe link; mensagem de sucesso é a mesma mesmo se o e-mail não existir
- [ ] Link abre o app por deep link (`gymapp://auth/reset-password`)
- [ ] Nova senha com as mesmas regras do cadastro
- [ ] Após redefinir, faz login automático

### US-1.4 — Sair 🔴
- [ ] Confirmação antes de sair
- [ ] Limpa sessão, cache do TanStack Query e estado do Zustand
- [ ] ⚠️ Se houver treino em andamento **não sincronizado**, avisa antes

### US-1.5 — Excluir conta 🔴 *(obrigatório para a App Store)*
- [ ] Em Perfil → Conta → Excluir conta
- [ ] Explica o que será apagado e que é irreversível
- [ ] Exige digitar `EXCLUIR` para confirmar
- [ ] Chama a Edge Function → remove arquivos do Storage e o usuário
- [ ] Faz logout e volta para boas-vindas

---

## Épico 2 — Onboarding 🔴

### US-2.1 — Completar perfil inicial 🔴
- [ ] 4 passos com barra de progresso, cada um com no máximo 3 campos
- [ ] Passo 1: nome, data de nascimento, sexo · Passo 2: altura, peso, unidade · Passo 3: objetivo + nível · Passo 4: frequência + lembretes
- [ ] Todos os passos após o 1º podem ser pulados
- [ ] O peso informado cria o primeiro registro em `body_measurements`
- [ ] Ao final, `onboarding_completed = true`
- [ ] Se o usuário fechar o app no meio, retoma do passo onde parou

### US-2.2 — Rotina sugerida 🟡
- [ ] Ao final do onboarding, sugere 1–3 templates compatíveis com objetivo, nível e frequência
- [ ] Aceitar copia o template para a conta (`copy_plan_template`) e define como plano ativo
- [ ] Pode recusar e criar a própria rotina

---

## Épico 3 — Biblioteca de Exercícios 🔴

### US-3.1 — Navegar e buscar 🔴
- [ ] Catálogo de 138 exercícios pré-carregado, agrupado por grupo muscular
- [ ] Busca full-text com debounce de 300ms, ignorando acentos e maiúsculas
- [ ] Filtros combináveis: grupo muscular, equipamento, favoritos, "meus exercícios"
- [ ] Lista virtualizada (FlashList), scroll fluido com os 138 itens do catálogo
- [ ] Sem resultado → estado vazio com atalho "Criar exercício personalizado"

### US-3.2 — Ver detalhe do exercício 🔴
- [ ] Nome, imagem/GIF, músculo principal e secundários, equipamento, dificuldade
- [ ] Instruções passo a passo numeradas + dicas
- [ ] Vídeo quando disponível
- [ ] **Meu histórico**: gráfico de evolução de carga/1RM + últimas sessões
- [ ] Meus recordes nesse exercício
- [ ] Botões: favoritar e adicionar a uma ficha

### US-3.3 — Criar exercício personalizado 🟡
- [ ] Nome, grupo muscular, equipamento, tipo de registro, unilateral, instruções, foto opcional
- [ ] Fica visível só para quem criou (`is_public = false`)
- [ ] Pode editar e excluir; excluir bloqueado se já houver histórico (ou avisa que apaga o histórico)

### US-3.4 — Favoritar 🟢
- [ ] Toque na estrela alterna favorito com atualização otimista
- [ ] Aba "Favoritos" na biblioteca

---

## Épico 4 — Rotinas de Treino 🔴

### US-4.1 — Criar rotina 🔴
- [ ] Nome (obrigatório), descrição, objetivo, nível, dias por semana
- [ ] Após criar, vai direto para adicionar as fichas

### US-4.2 — Gerenciar fichas 🔴
- [ ] Adicionar ficha com nome e rótulo (A, B, C…)
- [ ] Reordenar por arrastar
- [ ] Duplicar ficha dentro da mesma rotina
- [ ] Excluir com confirmação (histórico de sessões antigas é preservado)

### US-4.3 — Montar a ficha 🔴
- [ ] Adicionar exercícios pelo seletor (permite seleção múltipla)
- [ ] Por exercício: nº de séries, faixa de repetições (min–max), carga alvo, descanso, RPE, tempo, observação
- [ ] Reordenar exercícios por arrastar
- [ ] Agrupar em bi-set/tri-set
- [ ] Remover exercício com swipe
- [ ] Estimativa de duração calculada automaticamente: `Σ(séries × (tempo_execução + descanso))`

### US-4.4 — Usar template pronto 🔴
- [ ] Galeria com os templates do sistema, filtrável por nível/objetivo
- [ ] Pré-visualizar todas as fichas antes de copiar
- [ ] "Usar esta rotina" copia para a conta (a partir daí é totalmente editável)

### US-4.5 — Rotina ativa 🟡
- [ ] Definir uma rotina como ativa (`profiles.active_plan_id`)
- [ ] O dashboard sugere o próximo treino da rotina ativa (o que está há mais tempo sem ser feito)

### US-4.6 — Arquivar / duplicar 🟢
- [ ] Arquivar (soft delete via `archived_at`) mantém o histórico
- [ ] Duplicar cria cópia editável

---

## Épico 5 — Execução do Treino 🔴 ⭐

> **É o coração do app.** Precisa ser rápido, funcionar offline e nunca perder dados.

### US-5.1 — Iniciar treino 🔴
- [ ] A partir da ficha ou do dashboard
- [ ] `start_workout_session` cria a sessão com todas as séries já pré-preenchidas com as metas
- [ ] Se a última performance for maior que a meta, sugere a última carga usada
- [ ] Também é possível iniciar um "treino livre" sem ficha
- [ ] Bloqueia se já existir sessão ativa: oferece retomar ou descartar

### US-5.2 — Registrar série 🔴
- [ ] Campos de carga e reps já preenchidos; usuário só confirma
- [ ] Botões +/− com passo configurável (padrão 2,5 kg)
- [ ] Marcar concluída em **1 toque** + haptic
- [ ] Editar valor de série já concluída sem desmarcá-la
- [ ] Adicionar ou remover séries durante o treino
- [ ] Tipos de série: normal, aquecimento, drop-set, falha, back-off, AMRAP
- [ ] Exercício unilateral registra lado esquerdo e direito separadamente
- [ ] Campos variam conforme o `tracking_type` do exercício

### US-5.3 — Timer de descanso 🔴
- [ ] Inicia automaticamente ao marcar série (configurável)
- [ ] Usa `target_rest_seconds` do exercício ou o padrão do usuário
- [ ] Botões +15s / −15s / pular
- [ ] Continua correndo com o app em segundo plano
- [ ] Ao terminar: notificação local + som + vibração (respeitando as configurações)
- [ ] Visível de forma persistente na parte inferior da tela

### US-5.4 — Ajustar o treino na hora 🟡
- [ ] Adicionar exercício não previsto
- [ ] Pular exercício
- [ ] Trocar por outro (registra a substituição)
- [ ] Reordenar exercícios
- [ ] Nota por exercício e nota geral da sessão

### US-5.5 — Pausar, retomar e finalizar 🔴
- [ ] Cronômetro geral visível; pausar exclui o tempo parado da duração
- [ ] Fechar o app não perde nada (estado persistido em MMKV)
- [ ] Ao reabrir, oferece retomar a sessão
- [ ] Finalizar: se houver séries não concluídas, pergunta o que fazer
- [ ] Cancelar treino exige confirmação dupla

### US-5.6 — Funcionar offline 🔴
- [ ] Nenhuma operação do player depende de rede
- [ ] Alterações entram na outbox com `client_id`
- [ ] Sincroniza automaticamente ao recuperar conexão
- [ ] Indicador visual do status de sincronização
- [ ] Reenvio é idempotente — não duplica séries

### US-5.7 — Resumo pós-treino 🔴
- [ ] Duração, volume total, séries, repetições
- [ ] Lista dos PRs conquistados com o ganho em relação ao anterior
- [ ] Avaliação de sensação (1–5) e esforço percebido (1–10)
- [ ] Campo de anotações
- [ ] Comparação com o mesmo treino anterior ("+320 kg de volume") 🟢

---

## Épico 6 — Progresso e Análise 🟡

### US-6.1 — Histórico 🔴
- [ ] Lista de sessões ordenada da mais recente, com scroll infinito (20 por página)
- [ ] Cada item: nome, data, duração, volume, séries
- [ ] Calendário mensal com os dias treinados marcados
- [ ] Detalhe da sessão mostra tudo o que foi feito
- [ ] Editar sessão passada 🟢
- [ ] Excluir sessão com confirmação

### US-6.2 — Gráficos 🟡
- [ ] Volume por semana (barras), com filtro de período (4 sem / 3m / 6m / 1a)
- [ ] Distribuição de volume por grupo muscular (barras horizontais ou radar)
- [ ] Frequência semanal (heatmap estilo GitHub)
- [ ] Evolução por exercício: carga máxima e 1RM estimado ao longo do tempo
- [ ] Peso corporal ao longo do tempo
- [ ] Todo gráfico tem estado vazio explicativo quando faltam dados

### US-6.3 — Recordes pessoais 🟡
- [ ] Lista agrupada por grupo muscular
- [ ] Por exercício: carga máxima, mais repetições, maior volume, 1RM estimado
- [ ] Data da conquista e ganho sobre o recorde anterior
- [ ] Notificação de celebração no momento em que o PR acontece

### US-6.4 — Sequência (streak) 🟢
- [ ] Semanas consecutivas batendo a meta de treinos
- [ ] Exibida no dashboard com ícone de fogo

---

## Épico 7 — Medidas Corporais 🟡

### US-7.1 — Registrar medidas 🟡
- [ ] Peso e % de gordura sempre visíveis; circunferências em seções colapsáveis
- [ ] Uma medição por dia (nova no mesmo dia atualiza a existente)
- [ ] Histórico em lista e em gráfico
- [ ] Respeita a unidade escolhida (kg/cm ou lb/in)

### US-7.2 — Fotos de progresso 🟢
- [ ] Tirar ou escolher foto, marcar pose (frente/lado/costas)
- [ ] Grade cronológica
- [ ] Comparador lado a lado de duas datas
- [ ] ⚠️ Armazenamento **privado**, acesso só por URL assinada
- [ ] Excluir foto remove o arquivo do Storage também

---

## Épico 8 — Metas 🟢

### US-8.1 — Definir e acompanhar metas 🟢
- [ ] Tipos: treinos por semana, peso corporal, 1RM em um exercício, volume total
- [ ] Valor alvo e prazo
- [ ] Barra de progresso calculada a partir dos dados reais
- [ ] Notificação de parabéns ao atingir
- [ ] Encerrar ou cancelar meta

---

## Épico 9 — Notificações 🟡

### US-9.1 — Lembrete de treino 🟡
- [ ] Ativar/desativar, escolher horário e dias da semana
- [ ] Notificação local agendada (não depende de servidor)
- [ ] Não notifica se o usuário já treinou naquele dia
- [ ] Pedido de permissão feito **no contexto certo** (ao ativar), não na abertura do app
- [ ] Android 13+: permissão `POST_NOTIFICATIONS` tratada

### US-9.2 — Notificação de descanso 🔴
- [ ] Disparada pelo fim do timer, funciona com o app em segundo plano
- [ ] Categoria de alta prioridade no Android; som e vibração próprios

### US-9.3 — Push de engajamento 🟢
- [ ] "Faz 5 dias que você não treina" — via Edge Function agendada (`pg_cron`)
- [ ] Respeita a preferência do usuário e o fuso horário
- [ ] ⚠️ Só implementar se houver opt-out claro — push agressivo gera desinstalação

---

## Épico 10 — Configurações e Perfil 🟡

### US-10.1 — Editar perfil 🔴
- [ ] Nome, foto, data de nascimento, sexo, altura
- [ ] Upload de avatar com corte quadrado e compressão antes do envio

### US-10.2 — Preferências 🟡
- [ ] Tema: claro / escuro / sistema (aplica na hora)
- [ ] Unidades: métrico / imperial (converte toda a UI, o banco continua em kg/cm)
- [ ] Passo de incremento de carga
- [ ] Timer: auto-iniciar, som, vibração, descanso padrão
- [ ] Manter tela ligada durante o treino

### US-10.3 — Privacidade 🔴
- [ ] Links para Política de Privacidade e Termos
- [ ] Exportar meus dados (JSON) 🟡
- [ ] Excluir conta

### US-10.4 — Sobre 🟢
- [ ] Versão do app e do build, avaliar na loja, reportar problema (e-mail com diagnóstico)

---

## Épico 11 — Qualidade transversal 🔴

### US-11.1 — Acessibilidade 🟡
- [ ] Contraste mínimo AA (4.5:1) em todo texto
- [ ] Área de toque mínima de 44×44 pt
- [ ] Labels de acessibilidade em todo controle
- [ ] Layout não quebra com fonte aumentada até 200%
- [ ] Testado com VoiceOver (iOS) e TalkBack (Android) nos fluxos principais

### US-11.2 — Performance 🔴
- [ ] Cold start ≤ 2,5s
- [ ] Transição entre telas < 300ms
- [ ] Listas a 60fps com 200+ itens
- [ ] Imagens com cache e placeholder (`expo-image`)
- [ ] Marcar série responde em < 100ms (otimista, sem esperar a rede)

### US-11.3 — Tratamento de erro 🔴
- [ ] Error boundary global com tela de recuperação
- [ ] Erros de rede com retry automático (backoff exponencial)
- [ ] Mensagens em português e sem jargão técnico
- [ ] Sentry captura o erro com breadcrumb do que o usuário fez

---

## Épico 12 — Interface v2 🟡

> Nasceu da análise das referências visuais ([doc 12](./12-referencias-visuais.md)) e depende do
> design system v2 ([doc 07](./07-design-system-e-ux.md)). **Nenhuma destas histórias exige tabela
> nova** — todas leem dados que o banco já entrega. As que exigiriam estão em §4.2 da doc 12.

### US-12.1 — Anel de meta semanal 🟡
**Como** usuário **quero** ver de relance se estou em dia com a meta da semana **para** decidir se treino hoje.
- [ ] `RingStat` no topo do dashboard com `treinos_realizados / meta_semanal`
- [ ] Fonte: `get_dashboard_summary()` — sem consulta nova
- [ ] Anel completo muda para estado "meta batida" (preenchimento cheio + check)
- [ ] Frase de apoio muda conforme o estado: "Falta 1 pra fechar" · "Meta batida 🎉" · "Bora começar a semana"
- [ ] `accessibilityRole="progressbar"` com `accessibilityValue`
- [ ] Com "reduzir movimento" ativo, aparece já preenchido

### US-12.2 — Progresso da ficha no player 🟡
**Como** usuário **quero** saber quanto falta do treino **sem** contar séries na tela.
- [ ] `RingStat` pequeno no header do player com % de séries concluídas
- [ ] Atualiza a cada série marcada, junto com o haptic
- [ ] Número de séries (`8/18`) continua acessível ao leitor de tela

### US-12.3 — Faixa de sequência de 7 dias 🟢
**Como** usuário **quero** ver quais dias treinei na semana **para** não perder o ritmo.
- [ ] `StreakStrip` com os 7 dias, check lima no dia treinado e anel no dia de hoje
- [ ] Complementa (não substitui) o contador de semanas da US-6.4
- [ ] Toque em um dia abre a sessão daquele dia, se houver

### US-12.4 — Duração estimada da ficha 🟡
**Como** usuário **quero** saber quanto tempo o treino leva **para** decidir se cabe no meu dia.
- [ ] Estimativa exibida no card da ficha, no dashboard e na galeria de templates
- [ ] Calculada a partir de `workout_exercises` (ver RN-14) — sem campo novo
- [ ] Depois de 3 sessões da mesma ficha, passa a usar a **mediana real** do histórico
- [ ] Formato `~55 min`; o til deixa claro que é estimativa

### US-12.5 — Metadados no card da ficha 🟢
**Como** usuário **quero** identificar a ficha sem abrir **para** escolher mais rápido.
- [ ] `MetaChip`s com duração, grupos musculares predominantes e nível da rotina
- [ ] Capa usa a cor do grupo muscular predominante quando não há imagem
- [ ] Máximo de 3 chips; o resto vira `+2`

### US-12.6 — Modo foco no player 🟢
**Como** usuário que segue a prescrição **quero** ver um exercício por vez **para** não me perder na lista.
- [ ] Alternável pelo menu `⋮`; modo lista continua o padrão
- [ ] `RepCounter` gigante, carga e reps abaixo, Anterior/Próxima
- [ ] Preferência persiste em `user_settings`
- [ ] Trocar de modo preserva série atual, cronômetro e timer de descanso
- [ ] "Ver todas as séries" volta ao modo lista a um toque

### US-12.7 — Ação rápida no FAB 🟡
**Como** usuário **quero** as ações frequentes a um toque de qualquer tela.
- [ ] Botão `+` central na tab bar abre sheet com: treino livre · nova rotina · registrar medida · nova foto
- [ ] Disponível em todas as abas; ausente no player e em modais
- [ ] Cada item leva à tela já existente (nenhuma rota nova além do sheet)

### US-12.8 — Celebração unificada 🟡
**Como** usuário **quero** que conquistas tenham um momento claro **para** sentir o progresso.
- [ ] `CelebrationSheet` único para: novo PR, treino concluído, meta batida
- [ ] Haptic de sucesso + som opcional (respeita a preferência de som)
- [ ] Confete só quando "reduzir movimento" está desligado
- [ ] Sempre dispensável a um toque — nunca bloqueia o fluxo

### US-12.9 — Metas por grupo muscular 🟢 *(v1.1)*
- [ ] Tipo novo de meta: "N treinos de [grupo] por semana"
- [ ] ⚠️ Exige valor novo no enum de `user_goals` — **fora da v1**

### US-12.10 — Conquistas 🟢 *(v1.1)*
- [ ] Marcos derivados de dados existentes: nº de treinos, streak, PRs, volume acumulado
- [ ] Sem moeda virtual, sem anúncio, sem resgate ([doc 12, §3](./12-referencias-visuais.md))
- [ ] ⚠️ Exige tabelas `achievements` e `user_achievements` — **fora da v1**

---

## Regras de negócio consolidadas

| # | Regra |
|---|---|
| RN-01 | Volume = Σ (carga × repetições) de séries **concluídas**, **excluindo aquecimento** |
| RN-02 | 1RM estimado = `carga × (1 + reps/30)` (Epley), calculado só para 1–15 reps |
| RN-03 | Um usuário pode ter **no máximo 1** sessão com status `in_progress` ou `paused` |
| RN-04 | Excluir uma rotina **não** apaga o histórico de sessões (FK vira NULL) |
| RN-05 | Séries não concluídas são descartadas ao finalizar o treino |
| RN-06 | PR só é registrado a partir de série concluída que não seja aquecimento |
| RN-07 | Uma medição corporal por dia por usuário (nova sobrescreve) |
| RN-08 | Exercício do sistema (`created_by IS NULL`) não pode ser editado nem excluído pelo usuário |
| RN-09 | Templates do sistema são somente leitura — usar exige copiar |
| RN-10 | Banco sempre em unidade métrica; conversão só na camada de apresentação |
| RN-11 | Streak = semanas consecutivas em que o nº de treinos ≥ meta semanal |
| RN-12 | Sessão sem nenhuma série concluída não pode ser finalizada (só cancelada) |
| RN-13 | `client_id` garante idempotência: reenviar a mesma operação não duplica registro |
| RN-14 | Duração estimada da ficha = `300s` (aquecimento) `+ Σ target_sets × (execução + target_rest_seconds)`, onde execução = `target_duration_seconds` ou **30s** quando nulo. Exercícios com o mesmo `superset_group` só contam o descanso na última série do grupo. A partir de 3 sessões concluídas da ficha, a estimativa é substituída pela **mediana real** da duração |

---

## Matriz de priorização

| Épico | P0 🔴 | P1 🟡 | P2 🟢 | Fase |
|---|---|---|---|---|
| 1 — Conta | 5 | 0 | 0 | 1 |
| 2 — Onboarding | 1 | 1 | 0 | 1 |
| 3 — Exercícios | 2 | 1 | 1 | 2 |
| 4 — Rotinas | 4 | 1 | 1 | 3 |
| 5 — Execução | 6 | 1 | 0 | 4 |
| 6 — Progresso | 1 | 2 | 1 | 5 |
| 7 — Medidas | 0 | 1 | 1 | 6 |
| 8 — Metas | 0 | 0 | 1 | 6 |
| 9 — Notificações | 1 | 1 | 1 | 6 |
| 10 — Configurações | 2 | 1 | 1 | 6 |
| 11 — Qualidade | 2 | 1 | 0 | 7 |
| 12 — Interface v2 | 0 | 5 | 5 | 3–5 (ver roadmap) |
| **Total** | **24** | **15** | **12** | |

**Corte de escopo se o prazo apertar:** todos os 🟢 podem sair da v1 sem prejudicar o produto.
Os 🔴 são inegociáveis — sem eles o app não tem sentido ou é rejeitado na loja.

O Épico 12 é inteiramente 🟡/🟢 **de propósito**: é acabamento sobre funcionalidade que já existe.
Se o prazo apertar, o app lança com a v2 de tokens (já aplicada) e sem os componentes novos —
o visual muda, o escopo não.

---

[← Mapa de Telas](./05-mapa-de-telas.md) · [Índice](./README.md) · [Próximo: Design System →](./07-design-system-e-ux.md)
