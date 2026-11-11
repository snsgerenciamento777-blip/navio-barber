# PLANO_TESTES_RISCOS_IMPLEMENTACAO.md — Plano de Testes, Riscos e Implementação

**Versão:** 1.0  
**Data:** 2026-11-07  
**Autor:** Kilo Code (Orquestração: Aletheia v23)  
**Status:** Fase 0 — Spec Kit (especificação apenas, sem implementação)  
**Base:** Todos os documentos de especiação da Fase 0

---

## 1. Plano de Testes

### 1.1 Estratégia de Testes

O plano de testes segue a pirâmide de testes: unitários (base), integration (meio) e E2E (topo). Todos os critérios de aceitação definidos em `REQUISITOS_FUNCIONAIS_NAO_FUNCIONAIS.md` devem ser cobertos por testes.

| Camada | Ferramenta | Cobertura Alvo | Objetivo |
|--------|-----------|---------------|----------|
| Unit | Vitest | ≥ 80% | Lógica de negócio, validações, regras |
| Integration | Vitest + Testcontainers | ≥ 70% | APIs, banco de dados, transações |
| E2E | Playwright | Critical paths 100% | Fluxos completos do usuário |
| Contract | tRPC types + Pact | All public procedures | Contrato frontend ↔ backend |
| Performance | k6 / Lighthouse CI | p95 < 200ms API, < 2.5s TTI | Performance |

### 1.2 Testes Unitários — Regras de Negócio

Cada regra de negócio em `REGRAS_NEGOCIO_APROVADAS.md` deve ter testes unitários:

| Regra | Caso de Teste | Resultado Esperado |
|-------|--------------|-------------------|
| RG-AG-01 (antecedência mínima 2h) | Agendar para 1 hora daqui | Rejeitar com mensagem de antecedência mínima |
| RG-AG-01 | Agendar para 2 horas e 1 minuto daqui | Aceitar |
| RG-AG-02 (antecedência máxima 30 dias) | Agendar para 31 dias daqui | Rejeitar |
| RG-AG-02 | Agendar para 30 dias daqui | Aceitar |
| RG-AG-03 (slot disponível) | Agendar slot já ocupado | Rejeitar (conflito de horário) |
| RG-AG-03 | Agendar slot livre | Aceitar |
| RG-AG-04 (horário expediente) | Agendar fora do open_time/close_time | Rejeitar |
| RG-CL-01 (telefone único) | Cadastrar cliente com telefone existente | Rejeitar |
| RG-CL-03 (bloqueio 3 no-shows) | Cliente com 3 no-shows tenta agendar | Rejeitar |
| RG-CL-04 (inativo 6 meses) | Cliente sem atendimento há 6+ meses | Classificar como inativo |
| RG-NS-01 (no-show 15 min) | Agendamento com 16 min de atraso | Elegível para no-show automático |
| RG-NS-01 | Agendamento com 14 min de atraso | Não elegível para no-show |
| RG-NS-02 (estado válido) | Agendamento já cancelado | Não alterar |
| RG-NS-04 (idempotência) | Executar rotina 2x para mesmo agendamento | Apenas 1 no-show registrado |

### 1.3 Testes de Integração — Transações de Agendamento

| Cenário | Descrição | Critério de Aceitação |
|---------|-----------|----------------------|
| Concorrência de agendamento | Dois usuários tentam agendar o mesmo slot simultaneamente | Apenas um sucesso; o outro recebe erro de conflito |
| No-show durante remarcação | Rotina de no-show executa enquanto agendamento está sendo remarcado | Não sobrescrever a remarcação |
| Cancelamento após no-show | Barbeiro cancela agendamento já marcado como no-show | Permitido se slot ainda livre |
| Falha de transação | Banco indisponível durante no-show | Rollback; nenhum estado indefinido |

### 1.4 Testes E2E — Fluxos Críticos

| Fluxo | Passos | Critério de Aceitação |
|-------|--------|----------------------|
| Login do barbeiro | Acessar /login → inserir credenciais → dashboard | Redirecionado para dashboard com dados do usuário |
| Novo agendamento | Dashboard → novo agendamento → cliente → serviço → horário → confirmar | Agendamento criado; slot ocupado; notificação enviada |
| Cancelamento | Agendamento → cancelar → informar motivo | Status alterado para cancelado; slot liberado |
| Controle de atendimento | Agendamento → iniciar → concluir → forma de pagamento | Status concluído; pagamento registrado |
| Cadastro de cliente | Clientes → novo → nome + telefone → salvar | Cliente listado; telefone único |

### 1.5 Testes de Segurança e LGPD

| Teste | Descrição |
|-------|-----------|
| Senha não em texto puro | Verificar que senha armazenada é hash, não texto puro |
| Acesso não autenticado | Tentar acessar endpoint protegido sem token → 401 |
| Acesso não autorizado | Barbeiro tentando acessar configurações de admin → 403 |
| Telefone duplicado | Tentar cadastrar cliente com telefone existente → erro |
| Direito ao esquecimento | Solicitar exclusão de cliente → dados marcados como excluídos |

### 1.6 Critérios de Aceitação Gerais

- [ ] Todos os requisitos P0 têm pelo menos 1 teste de aceitação
- [ ] Todas as regras de negócio RG- têm teste unitário correspondente
- [ ] Fluxos críticos E2E passam em 100% das execuções
- [ ] Nenhum teste falha na suíte de CI
- [ ] Coverage unit ≥ 80%, integration ≥ 70%

---

## 2. Riscos, Dependências e Lacunas

### 2.1 Riscos Identificados

| ID | Risco | Probabilidade | Impacto | Mitigação | Owner |
|----|-------|---------------|---------|-----------|-------|
| R-01 | Quota Claude Code esgota (5h/semana) | Alta | Médio | Usar tier Haiku para volume; Copilot Fleet fallback | Kilo |
| R-02 | Especificações mudam durante implementação | Média | Alto | Freeze de spec por fase; ciclos Spec Kit converge | Comandante |
| R-03 | Integração frontend/backend (tipos compartilhados) | Média | Alto | tRPC types shared; contract tests | Claude |
| R-04 | LGPD compliance gaps | Baixa | Crítico | lgpd-skills auditoria contínua; DPO envolvido cedo | Kilo |
| R-05 | Performance mobile | Média | Médio | PWA desde fase 0; Lighthouse CI no pipeline | Claude |
| R-06 | 9Router exposto em 0.0.0.0 (segurança) | Crítica | Crítico | Reiniciar com `--host 127.0.0.1`; TLS para remoto | Kilo |
| R-07 | Cliente sem app não recebe push | Alta | Médio | Documentar como limitação; alternativas Fase 2+ | Kilo |
| R-08 | GEMINI_API_KEY não persistida (sessão apenas) | Média | Baixo | Usar Claude Code (subscription) como primário | Kilo |
| R-09 | OpenCode não autenticado | Média | Baixo | Não usar OpenCode como worker; apenas Claude + Copilot | Kilo |
| R-10 | RBAC é inferência (não confirmado no HAR) | Média | Médio | Validar com Comandante antes de implementar | Comandante |

### 2.2 Dependências

| ID | Dependência | Tipo | Status | Impacto se não disponível |
|----|------------|------|--------|--------------------------|
| D-01 | Node.js 20+ / Bun | Técnica | Disponível | Não pode desenvolver |
| D-02 | PostgreSQL 16 | Técnica | Disponível (Docker) | Sem persistência de dados |
| D-03 | Redis 7 | Técnica | Disponível (Docker) | Sem jobs assíncronos (no-show, notificações) |
| D-04 | Firebase FCM | Externa | Disponível (Free Tier) | Sem notificações push |
| D-05 | Better Auth | Biblioteca | Disponível (npm) | Sem autenticação |
| D-06 | Prisma ORM | Biblioteca | Disponível (npm) | Sem ORM para banco de dados |
| D-07 | Conta GitHub (Copilot) | Externa | Disponível | Sem Copilot CLI para paralelismo |

### 2.3 Lacunas Conhecidas

| ID | Lacuna | Descrição | Plano |
|----|--------|-----------|-------|
| L-01 | Área pública do cliente | Zero confirmações no HAR | Fora do MVP (Fase 2+) |
| L-02 | Estados intermediários do agendamento | Não capturados no HAR | Inferência; validar na implementação |
| L-03 | Modelo de comissão por serviço | Não está no HAR | Definir com Comandante |
| L-04 | Dinheiro e voucher como pagamento | Não confirmados no HAR | Incluir como opções (D-01: pagamento presencial) |
| L-05 | Regras de disparo de notificações | Conteúdo completo não capturado | Definir com base nos requisitos M03 |
| L-06 | RBAC | Sem dado de permissões no HAR | Validar com Comandante |

---

## 3. Plano de Implementação do MVP

### 3.1 Fases de Implementação

O plano segue o `IMPLEMENTATION-ROADMAP.md`, adaptado para as decisões aprovadas (D-01 a D-08).

#### Fase 0 — Fundação (Semana 1-2) — *Especificação e Setup*

| Task | Descrição | Agente | Entregável |
|------|-----------|--------|-----------|
| 0.1 | Spec Kit setup (estrutura de specs) | Opus | `docs/SPEC.md` + `docs/specs/` |
| 0.2 | Constitution e princípios | Opus | `docs/SPEC.md` (concluído nesta missão) |
| 0.3 | Especificações funcionais | Opus | `docs/specs/` (concluído nesta missão) |
| 0.4 | Regras de negócio e matriz de rastreabilidade | Opus | `docs/specs/REGRAS_NEGOCIO_APROVADAS.md` (concluído) |
| 0.5 | Schema Prisma conceitual | Sonnet | `prisma/schema.prisma` (proposto em ARQUITETURA_TECNICA.md) |
| 0.6 | Auth setup (Better Auth) | Sonnet | Configuração de auth (não implementado nesta missão) |
| 0.7 | CI/CD base | Haiku | GitHub Actions: lint, typecheck, test, build |
| 0.8 | Design system base | Sonnet | Componentes base shadcn/ui |
| 0.9 | Infra local (Docker Compose) | Haiku | Postgres + Redis + seed |

#### Fase 1 — Core Barbeiro (Semana 3-5) — *P0 Requirements*

| Task | Descrição | Espec Ref | Prioridade |
|------|-----------|-----------|------------|
| 1.1 | Calendar View (semana/dia/mês) | RF-BB-02 | P0 |
| 1.2 | Slot Availability API | RF-BB-02 | P0 |
| 1.3 | Create Appointment (multi-step) | RF-BB-05 | P0 |
| 1.4 | Appointment Lifecycle (aguardando→em_andamento→concluído) | RF-BB-06 | P0 |
| 1.5 | Cancel/Reschedule | RF-BB-07 | P0 |
| 1.6 | Finalize Batch (finalize-previous) | RF-BB-06 | P0 |
| 1.7 | Service CRUD | RF-BB-03 | P0 |
| 1.8 | Service Catalog API | RF-BB-03 | P0 |
| 1.9 | Client CRUD | RF-BB-04 | P0 |
| 1.10 | Client History | RF-BB-04 | P0 |
| 1.11 | Barber Dashboard | RF-BB-01 | P0 |
| 1.12 | Shop Settings | RF-BB-08 | P1 |
| 1.13 | Professional Profile | RF-BB-08 | P1 |

#### Fase 2 — Core Cliente (Semana 6-8) — *P0 Requirements*

**Nota:** Área pública do cliente depende de D-02 (cliente sem login). Como D-02 = não (apenas telefone), a área pública é simplificada: o barbeiro cadastra o cliente por telefone na hora.

| Task | Descrição | Espec Ref | Prioridade |
|------|-----------|-----------|------------|
| 2.1 | Client identification by phone (barbeiro cadastra) | RF-BB-04 | P0 |
| 2.2 | Quick client registration | RF-BB-04 | P0 |
| 2.3 | My bookings (barbeiro view) | RF-BB-05 | P0 |

**Área pública do cliente (descoberta, perfil, agendamento pelo cliente):** FORA do MVP (Fase 2+).

#### Fase 3 — Transversais e Integrações (Semana 9-11) — *P1/P2*

| Task | Descrição | Espec Ref | Prioridade |
|------|-----------|-----------|------------|
| 3.1 | Auth do barbeiro (login/sessão) | RF-TR-01 | P0 |
| 3.2 | Notificações Push (FCM) | RF-TR-02 | P1 |
| 3.3 | RBAC (barbeiro vs admin) | RF-TR-03 | P1 |
| 3.4 | Pagamentos presenciais (dinheiro, cartão, PIX, voucher) | RF-BB-09 | P1 |
| 3.5 | Relatórios simples | RF-BB-10 | P2 |
| 3.6 | LGPD compliance (lgpd.md) | RNF-05 | P2 |
| 3.7 | PWA setup | RNF-04 | P2 |

### 3.2 Definição de Pronto (Definition of Done)

#### Por Task
- [ ] Spec escrita e aprovada (Spec Kit)
- [ ] Testes escritos primeiro (TDD) — unit + integration
- [ ] Implementação passa todos os testes
- [ ] TypeScript strict mode — zero `any`
- [ ] Lint + typecheck passam
- [ ] Code review (Haiku/GPT-4o-mini) — `review-gate` PASS
- [ ] Diff integrado por Opus no main
- [ ] Deploy staging validado

#### Por Fase
- [ ] Todas as tasks P0 da fase completas
- [ ] Testes E2E críticos passam (Playwright)
- [ ] Documentação atualizada (README, API docs)
- [ ] Métricas de qualidade: coverage ≥ 80% (unit), ≥ 70% (integration)

### 3.3 Estimativa de Esforço

| Fase | Tasks P0 | Tasks P1 | Tasks P2 | Semanas Estimadas | Complexidade |
|------|----------|----------|----------|-------------------|--------------|
| 0. Fundação | 5 | 2 | 1 | 2 | Alta (setup + specs) |
| 1. Core Barbeiro | 9 | 2 | 0 | 3 | Alta (domain complexo) |
| 2. Core Cliente | 3 | 0 | 0 | 2 | Média (simplificado por D-02) |
| 3. Transversais | 1 | 4 | 2 | 3 | Média (integrações) |
| **Total** | **18** | **8** | **3** | **~10** | — |

**Nota:** Fase 2 reduzida de 9 para 3 tasks porque a área pública do cliente está fora do MVP (D-02).

### 3.4 Rastreabilidade Requisito → Task → Fase

| Requisito | Task(s) | Fase | Prioridade |
|-----------|---------|------|------------|
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
| RF-TR-01 | 3.1 | 3 | P0 |
| RF-TR-02 | 3.2 | 3 | P1 |
| RF-TR-03 | 3.3 | 3 | P1 |
| RNF-01 a 05 | 0.6, 0.7, 3.6, 3.7 | 0,3 | P0-P1 |

---

## 4. Rastreabilidade Final — Todas as Decisões → Todos os Requisitos

| Decisão | Valor | Requisitos Afetados | Regras de Negócio Afetadas |
|---------|-------|-------------------|-------------------------|
| D-01 | Sem pagamento online | RF-BB-09, RF-TR-02 (sem checkout online) | RG-FN-01 |
| D-02 | Cliente sem login | Área pública do cliente fora do MVP; RF-BB-04 (cadastro por barbeiro) | — |
| D-03 | Push (FCM) prioritário | RF-TR-02 | RG-NT-01 a RG-NT-04 |
| D-04 | Antecedência mínima 2h | RF-BB-05 | RG-AG-01 |
| D-05 | Antecedência máxima 30 dias | RF-BB-02, RF-BB-05 | RG-AG-02 |
| D-06 | Bloqueio após 3 no-shows | RF-BB-04, RF-BB-05 | RG-CL-03 |
| D-07 | Inativo após 6 meses | RF-BB-04 | RG-CL-04 |
| D-08 | No-show após 15 min | RF-BB-04, RF-BB-06 | RG-NS-01 a RG-NS-09 |

---

## 5. Próxima Missão Recomendada

**Missão 09 — Início da Implementação Fase 0 (Spec Kit)**

Objetivo: Passar da especificação para o setup técnico inicial:
1. Executar `specify init` (com aprovação do Comandante)
2. Criar schema Prisma baseado em ARQUITETURA_TECNICA.md
3. Configurar Better Auth
4. Configurar CI/CD base
5. Configurar Docker Compose local

**Não autorizado:** Implementar funcionalidades de produto (RF-BB-01 a RF-TR-03). Apenas setup de infraestrutura e configuração base.

---

⚓ **Navio Barber 2.0 — Navegar com evidências, construir com precisão.**