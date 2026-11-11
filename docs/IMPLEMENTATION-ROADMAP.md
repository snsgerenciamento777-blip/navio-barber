# Navio Barber 2.0 — Implementation Roadmap

> **Versão:** 1.0  
> **Data:** 2026-11-06  
> **Base:** REQUISITOS_FUNCIONAIS_MVP.md + MAPA_FUNCIONAL_HORA_DO_ESTILO.md  
> **Orquestração:** Aletheia v23  
> **Code Sovereignty:** Claude Opus 5.5 (Comandante)

---

## 1. Visão Geral da Implementação

### 1.1 Estratégia: Spec-Driven Development (SDD)
Usando **GitHub Spec Kit** para criar especificações antes da implementação, com ciclos iterativos Specify → Plan → Tasks → Implement → Converge.

### 1.2 Arquitetura Multi-Agente
- **Fase 1-2**: Team Claude (Opus/Sonnet/Haiku) — subscription, $0 marginal
- **Fase 3+**: Team Copilot (Fleet/BYOK) para paralelismo massivo
- **Sempre**: Aletheia orquestra, Opus integra, worktrees isoladas

### 1.3 Stack Tecnológica Definida
| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18 + Next.js 14 (App Router), Tailwind CSS + shadcn/ui |
| **Backend** | Node.js 20+ / Bun, tRPC / Hono, PostgreSQL 16 + Prisma ORM |
| **Auth** | Better Auth / Clerk |
| **Realtime** | Socket.io / Pusher |
| **Jobs** | BullMQ + Redis |
| **Deploy** | Vercel (Frontend) + Railway/Render (Backend) |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Sentry + PostHog |

---

## 2. Sequência de Implementação (MVP)

### 2.1 Fase 0: Fundação (Semana 1-2) — *Crítica*

| Task | Agente | Playbook | Dependências | Entregável |
|------|--------|----------|--------------|------------|
| **0.1 Spec Kit Init** | Opus | `direct` | - | `specify init navio-barber --integration copilot` |
| **0.2 Constitution** | Opus | `direct` | 0.1 | `SPEC.md` com princípios do projeto |
| **0.3 Specs MVP** | Opus | `plan-big-execute-small` | 0.2 | Specs para cada domínio (BB, CL, TR) |
| **0.4 Schema Prisma** | Sonnet | `plan-execute` | 0.3 | `prisma/schema.prisma` completo |
| **0.5 Auth Setup** | Sonnet | `plan-execute` | 0.4 | Better Auth configurado + migrations |
| **0.6 CI/CD Base** | Haiku | `cascade` | 0.4 | GitHub Actions: lint, typecheck, test, build |
| **0.7 Design System Base** | Sonnet | `scout-then-build` | 0.3 | `packages/ui` com tokens, componentes base |
| **0.8 Infra Local** | Haiku | `direct` | - | Docker Compose (Postgres, Redis) + seed |

### 2.2 Fase 1: Core Barbeiro (Semana 3-5) — *P0 Requirements*

#### 2.2.1 Domínio: Agenda & Agendamentos (RF-BB-02, RF-BB-05, RF-BB-06, RF-BB-07)

| Task | Agente | Playbook | Spec Ref | Critérios |
|------|--------|----------|----------|-----------|
| **1.1 Calendar View** | Sonnet | `plan-execute` | RF-BB-02 | Semana/dia/mês, slots coloridos, "agora" indicator |
| **1.2 Slot Availability API** | Sonnet | `cascade` | RF-BB-05 | tRPC procedure: getAvailableSlots(date, professionalId) |
| **1.3 Create Appointment** | Sonnet | `plan-execute` | RF-BB-05 | Multi-step: client → service → slot → confirm |
| **1.4 Appointment Lifecycle** | Sonnet | `plan-execute` | RF-BB-06 | Status: aguardando → em_andamento → concluído |
| **1.5 Cancel/Reschedule** | Sonnet | `cascade` | RF-BB-07 | Validação status, motivo, liberação slot |
| **1.6 Finalize Batch** | Haiku | `direct` | RF-BB-06 | PUT /appointments/finalize-previous |

#### 2.2.2 Domínio: Serviços (RF-BB-03)

| Task | Agente | Playbook | Spec Ref | Critérios |
|------|--------|----------|----------|-----------|
| **1.7 Service CRUD** | Sonnet | `plan-execute` | RF-BB-03 | Nome, preço, duração (min 15min), comissão, ativo/inativo |
| **1.8 Service Catalog API** | Haiku | `cascade` | RF-BB-03 | Listagem para agendamento (apenas ativos) |

#### 2.2.3 Domínio: Clientes (RF-BB-04)

| Task | Agente | Playbook | Spec Ref | Critérios |
|------|--------|----------|----------|-----------|
| **1.9 Client CRUD** | Sonnet | `plan-execute` | RF-BB-04 | Nome, telefone (único), email, nascimento, preferências, status |
| **1.10 Client History** | Haiku | `direct` | RF-BB-04 | Histórico de atendimentos visível no perfil |

#### 2.2.4 Domínio: Dashboard & Config (RF-BB-01, RF-BB-08)

| Task | Agente | Playbook | Spec Ref | Critérios |
|------|--------|----------|----------|-----------|
| **1.11 Barber Dashboard** | Sonnet | `scout-then-build` | RF-BB-01 | Cards: hoje, atendidos, receita, ocupação + próximos 2h |
| **1.12 Shop Settings** | Sonnet | `plan-execute` | RF-BB-08 | Estabelecimento, horário/semana, dias fechados, notificações |
| **1.13 Professional Profile** | Haiku | `direct` | RF-BB-08 | Perfil pessoal do barbeiro logado |

### 2.3 Fase 2: Core Cliente (Semana 6-8) — *P0 Requirements*

#### 2.3.1 Público / Descoberta (RF-CL-01, RF-CL-02)

| Task | Agente | Playbook | Spec Ref | Critérios |
|------|--------|----------|----------|-----------|
| **2.1 Public Landing** | Sonnet | `plan-execute` | RF-CL-01 | Busca localização/nome, lista profissionais, avaliação |
| **2.2 Professional Profile (Public)** | Sonnet | `scout-then-build` | RF-CL-02 | Serviços, preços, horário, avaliações, galeria |

#### 2.3.2 Fluxo de Agendamento Cliente (RF-CL-03 a RF-CL-06)

| Task | Agente | Playbook | Spec Ref | Critérios |
|------|--------|----------|----------|-----------|
| **2.3 Service Selection** | Sonnet | `plan-execute` | RF-CL-03 | Multi-select, duração/preço total automático |
| **2.4 Slot Selection** | Sonnet | `cascade` | RF-CL-04 | Calendário visual, apenas slots livres, navegação meses |
| **2.5 Client Identification** | Sonnet | `plan-execute` | RF-CL-05 | Busca por telefone, cadastro rápido novo cliente |
| **2.6 Booking Confirmation** | Sonnet | `plan-execute` | RF-CL-06 | Resumo completo, termos, notificações, código confirmação |

#### 2.3.3 Gestão de Agendamentos Cliente (RF-CL-07, RF-CL-08, RF-CL-09)

| Task | Agente | Playbook | Spec Ref | Critérios |
|------|--------|----------|----------|-----------|
| **2.7 My Bookings** | Sonnet | `plan-execute` | RF-CL-07 | Futuros + histórico, filtros, detalhes, cancelar/remarcar |
| **2.8 Client Cancel** | Haiku | `cascade` | RF-CL-08 | Status válido, motivo opcional, liberação slot, notificação |
| **2.9 Client Reschedule** | Haiku | `cascade` | RF-CL-09 | Validação disponibilidade, notificação profissional |

### 2.4 Fase 3: Transversais & Integrações (Semana 9-11) — *P1/P2*

| Task | Agente | Playbook | Spec Ref | Critérios |
|------|--------|----------|----------|-----------|
| **3.1 Auth Barbeiro** | Sonnet | `plan-execute` | RF-TR-01 | Login email/telefone+senha, recovery, sessão persistente |
| **3.2 Notifications (Push)** | Sonnet | `plan-execute` | RF-TR-02 | FCM token, confirmação, lembrete (24h), cancel/reagenda |
| **3.3 RBAC** | Sonnet | `direct` | RF-TR-03 | Barbeiro (própria agenda) vs Admin (config, profissionais, relatórios) |
| **3.4 Payments (Presencial)** | Sonnet | `plan-execute` | RF-BB-09 | Dinheiro, cartão, PIX, voucher — comissão por serviço |
| **3.5 Reports (Simples)** | Haiku | `scout-then-build` | RF-BB-10 | Período, CSV, no-show rate, atendimentos, receita, comissões |
| **3.6 LGPD Compliance** | Opus | `direct` | RNF-05 | Consentimento, direito esquecimento, lgpd.md, lgpd-check |
| **3.7 PWA Setup** | Haiku | `cascade` | RNF-04 | Service Worker, manifest, offline-capable |

---

## 3. Playbooks por Fase

| Fase | Playbook Principal | Workers Típicos | Estratégia |
|------|-------------------|-----------------|------------|
| **0. Fundação** | `direct` + `plan-big-execute-small` | 1-2 (Opus lead) | Especificação primeiro, schema shared |
| **1. Core Barbeiro** | `plan-execute` + `parallel-worktrees` | 2-3 (Sonnet) | Features sequenciais com worktrees para independentes |
| **2. Core Cliente** | `plan-execute` + `parallel-worktrees` | 2-3 (Sonnet) | Fluxo linear, worktrees para frontend/backend paralelo |
| **3. Transversais** | `scout-then-build` + `review-gate` | 1-2 (Sonnet/Haiku) | Research → build → review gate obrigatório |

---

## 4. Orquestração Aletheia por Exemplo

### 4.1 Exemplo: Implementar RF-BB-05 (Novo Agendamento)

```bash
# 1. Comandante cria orquestração
/alethe new "RF-BB-05: Novo Agendamento Multi-step" \
  --playbook plan-execute \
  --why "Feature P0 crítica, fluxo sequencial com validações" \
  --lead claude:opus

# 2. Aletheia gera plano com fases:
#    - plan (Opus): Decompor em steps tRPC + UI components
#    - execute (Sonnet): Implementar backend + frontend
#    - review-gate (Haiku): Review diff + testes

# 3. Executar wave
/alethe run plan.json --in current --detach
/alethe wait

# 4. Revisar e integrar
/alethe report
# Opus integra diffs aprovados
```

### 4.2 Exemplo: Features Paralelas (Serviços + Clientes)

```bash
# Playbook parallel-worktrees
/alethe new "RF-BB-03 + RF-BB-04: Serviços e Clientes CRUD" \
  --playbook parallel-worktrees \
  --why "Domínios independentes, compartilham apenas schema Prisma" \
  --lead claude:opus

# Workers:
# - Worker 1 (Sonnet): Service CRUD (worktree A)
# - Worker 2 (Sonnet): Client CRUD (worktree B)
# - Integrator (Opus): Merge diffs, run full test suite
```

---

## 5. Definição de Pronto (Definition of Done)

### 5.1 Por Task
- [ ] Spec escrita e aprovada (Spec Kit)
- [ ] Testes escritos primeiro (TDD) — unit + integration
- [ ] Implementação passa todos os testes
- [ ] TypeScript strict mode — zero `any`
- [ ] Lint + typecheck passam
- [ ] Code review (Haiku/GPT-4o-mini) — `review-gate` PASS
- [ ] Diff integrado por Opus no main
- [ ] Deploy staging validado

### 5.2 Por Fase
- [ ] Todas as tasks P0 da fase completas
- [ ] Testes E2E críticos passam (Playwright)
- [ ] Documentação atualizada (README, API docs)
- [ ] Métricas de qualidade: coverage ≥ 80% (unit), ≥ 70% (integration)

---

## 6. Rastreabilidade Requisitos → Tasks

| Requisito | Tasks | Fase | Prioridade |
|-----------|-------|------|------------|
| RF-BB-01 | 1.11 | 1 | P0 |
| RF-BB-02 | 1.1, 1.2 | 1 | P0 |
| RF-BB-03 | 1.7, 1.8 | 1 | P0 |
| RF-BB-04 | 1.9, 1.10 | 1 | P0 |
| RF-BB-05 | 1.3, 1.4 | 1 | P0 |
| RF-BB-06 | 1.4, 1.6 | 1 | P0 |
| RF-BB-07 | 1.5 | 1 | P0 |
| RF-BB-08 | 1.12, 1.13 | 1 | P1 |
| RF-BB-09 | 3.4 | 3 | P1 |
| RF-BB-10 | 3.5 | 3 | P2 |
| RF-BB-11 | 1.12 (admin part) | 1 | P2 |
| RF-CL-01 | 2.1 | 2 | P0 |
| RF-CL-02 | 2.2 | 2 | P0 |
| RF-CL-03 | 2.3 | 2 | P0 |
| RF-CL-04 | 2.4 | 2 | P0 |
| RF-CL-05 | 2.5 | 2 | P0 |
| RF-CL-06 | 2.6 | 2 | P0 |
| RF-CL-07 | 2.7 | 2 | P0 |
| RF-CL-08 | 2.8 | 2 | P0 |
| RF-CL-09 | 2.9 | 2 | P0 |
| RF-CL-10 | 3.3 (profile) | 3 | P1 |
| RF-TR-01 | 3.1 | 3 | P0 |
| RF-TR-02 | 3.2 | 3 | P1 |
| RF-TR-03 | 3.3 | 3 | P1 |
| RF-TR-04 | 0.4, 0.5 | 0 | P0 |
| RNF-01 a 05 | 0.6, 0.7, 3.6, 3.7 | 0,3 | P0-P1 |

---

## 7. Estimativa de Esforço

| Fase | Tasks P0 | Tasks P1 | Tasks P2 | Semanas Estimadas | Complexidade |
|------|----------|----------|----------|-------------------|--------------|
| **0. Fundação** | 5 | 2 | 1 | 2 | Alta (setup + specs) |
| **1. Core Barbeiro** | 9 | 2 | 0 | 3 | Alta (domain complexo) |
| **2. Core Cliente** | 9 | 0 | 0 | 3 | Média (fluxo linear) |
| **3. Transversais** | 1 | 4 | 2 | 3 | Média (integrações) |
| **Total** | **24** | **8** | **3** | **~11** | — |

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Quota Claude esgota** | Alta | Médio | Copilot Fleet fallback, tier Haiku para volume |
| **Specs mudam durante impl.** | Média | Alto | Spec Kit converge cycles, freeze spec por fase |
| **Integração frontend/backend** | Média | Alto | tRPC types shared, contract tests (Pact) |
| **LGPD compliance gaps** | Baixa | Crítico | lgpd-skills auditoria contínua, DPO envolvido cedo |
| **Performance mobile** | Média | Médio | PWA desde fase 0, Lighthouse CI no pipeline |
| **9Router security** | Crítica | Crítico | Fix imediato: `--host 127.0.0.1`, TLS para remoto |

---

## 9. Próximas Fases (Pós-MVP)

### Fase 2 — Intelligence (Q2 2027)
- Marketing automation engine
- Fidelidade + Pacotes + Recorrência (RF-EX-02)
- Analytics dashboard v1 (RF-EX-04)
- WhatsApp Business API integration (RF-EX-08)
- Mobile PWA otimizada (RF-EX-06)

### Fase 3 — Scale (Q3 2027)
- Multi-unidade / Franquias (RF-EX-05)
- Marketplace de profissionais (RF-EX-10)
- IA: Previsão de demanda + Sugestão de preços
- API pública para integrações (RF-EX-04)
- White-label para redes

### Fase 4 — Ecosystem (Q4 2027+)
- App nativo iOS/Android (React Native) (RF-EX-06)
- PDV offline-first (RF-EX-09)
- Integração contabilidade (ContaAzul, Omie)
- Marketplace de add-ons
- Comunidade de barbeiros

---

## 10. Comandos de Execução Rápida

```bash
# Iniciar Fase 0
/alethe new "Fase 0: Fundação Navio Barber" --playbook plan-big-execute-small --why "Setup completo + specs MVP"

# Ver progresso
/alethe status
/alethe report

# Ajustar budget se necessário
/alethe budget --max-calls 30 --max-reported-cost-usd 10

# Mudar para modo balanced (delegação ativa)
/alethe balanced

# Paralelizar Fase 1 (serviços + clientes independentes)
/alethe new "Fase 1.2+1.3: Serviços e Clientes CRUD" --playbook parallel-worktrees --why "Domínios independentes"
```

---

*Roadmap baseado em REQUISITOS_FUNCIONAIS_MVP.md e MAPA_FUNCIONAL_HORA_DO_ESTILO.md. Atualizar conforme specs são refinadas via Spec Kit e validadas pelo Comandante.*