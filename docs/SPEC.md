# SPEC.md — Constituição do Projeto Navio Barber 2.0

**Versão:** 1.0  
**Data:** 2026-11-07  
**Autor:** Kilo Code (Orquestração: Aletheia v23)  
**Status:** Fase 0 — Spec Kit (especificação apenas, sem implementação)

---

## 1. Visão e Propósito

O Navio Barber 2.0 é um sistema de gestão para barbearias modernas, focado em agendamento, gestão de clientes, controle de serviços e profissionais, e operações de caixa. O MVP (Produto Mínimo Viável) cobre o fluxo completo do barbeiro: dashboard, agenda, cadastro de clientes e profissionais, agendamento, atendimento, cancelamento/remarcação e configurações da barbearia.

Este documento é a **constituição** do projeto — princípios imutáveis que orientam todas as decisões de especificação, arquitetura e implementação.

---

## 2. Princípios Fundamentais

| # | Princípio | Descrição |
|---|-----------|-----------|
| P-01 | **Evidenças primeiro** | Nada é especificado sem respaldo em evidências (HAR, documentos de engenharia reversa, decisões aprovadas). Hipóteses são explicitamente marcadas como tal. |
| P-02 | **Código soberania** | O Comandante (Claude Opus) integra todos os diffs. Workers operam em worktrees isoladas. |
| P-03 | **Spec-Driven Development** | Especificação antes de implementação. Ciclos Specify → Plan → Tasks → Implement → Converge. |
| P-04 | **Custo zero adicional** | Orçamento autorizado: R$ 0,00. Nenhum billing, nenhum modelo pago, nenhum serviço contratado. |
| P-05 | **LGPD por design** | Consentimento, direito ao esquecimento, portabilidade e auditoria de acessos desde o dia 1. |
| P-06 | **Sem cópia de terceiros** | O Navio Barber 2.0 mantém identidade própria. Não copia código, marca ou identidade visual de nenhum sistema de referência. |
| P-07 | **MVP primeiro** | Funcionalidades fora do escopo do MVP são adiadas para Fase 2+. Não há exceções sem aprovação do Comandante. |
| P-08 | **Transação segura** | Nenhuma alteração de estado de agendamento ocorre sem verificação atômica do estado atual. Idempotência é obrigatória. |

---

## 3. Escopo do MVP (20 Funcionalidades)

Organizado em 4 grupos, conforme ETAPA 3 da Missão 06:

**Grupo 1 — Autenticação e Perfil (2 itens)**
1. Login do barbeiro — CONFIRMADA (parcial)
2. Perfil do barbeiro logado — CONFIRMADA

**Grupo 2 — Agendamento e Atendimento (6 itens)**
3. Dashboard com resumo do dia — CONFIRMADA (parcial)
4. Visualização de agenda (slots disponíveis) — CONFIRMADA
5. Consulta de agendamentos por período — CONFIRMADA
6. Finalização de agendamentos anteriores — CONFIRMADA
7. Cadastro de clientes — CONFIRMADA (parcial)
8. Cadastro de profissionais — CONFIRMADA (parcial)

**Grupo 3 — Cadastros e Configurações da Barbearia (7 itens)**
9. Seleção de funcionário/empresa — CONFIRMADA
10. Catálogo de planos e assinaturas — CONFIRMADA
11. Status de setup do dashboard — CONFIRMADA
12. Dados do estabelecimento — CONFIRMADA (parcial)
13. Horário de funcionamento — CONFIRMADA (parcial)
14. Dia fechado (schedule_exception) — CONFIRMADA (parcial)
15. Intervalo de almoço (lunchPeriod) — CONFIRMADA (parcial)

**Grupo 4 — Operações, Notificações e Pacotes (5 itens)**
16. Pagamento online — EXCLUÍDO (D-01: apenas pagamento presencial)
17. Notificações push (FCM) — CONFIRMADA
18. Lista de notificações — CONFIRMADA
19. Ausências de profissionais — CONFIRMADA
20. Pacotes vendidos — CONFIRMADA

**Fora do MVP (Fase 2+):** área pública do cliente, relatórios detalhados, analytics preditivos, pontos de fidelidade, WhatsApp Business API, email/SMS, NF-e, pagamento online.

---

## 4. Decisões do Comandante Aprovadas (D-01 a D-08)

Todas as 8 decisões estão registradas e aprovadas em `docs/DECISOES_DO_COMANDANTE.md`. Elas são vinculantes para esta especificação:

| ID | Decisão | Impacto na Especificação |
|---|---------|-------------------------|
| D-01 | Sem pagamento online no MVP | Módulo financeiro registra apenas pagamentos presenciais (dinheiro, cartão, PIX, voucher) |
| D-02 | Cliente agenda por telefone, sem login | Sem tela de cadastro/login do cliente, sem área logada do cliente no MVP |
| D-03 | Push (FCM) canal prioritário | Apenas notificações push via Firebase; alternativas para clientes sem app são limitação documentada |
| D-04 | Antecedência mínima: 2 horas | Regra de validação no agendamento: não permite marcar para < 2 horas |
| D-05 | Antecedência máxima: 30 dias | Calendário mostra slots apenas até 30 dias à frente |
| D-06 | Bloqueio após 3 no-shows | Cliente bloqueado para novos agendamentos após 3 faltas sem aviso |
| D-07 | Inativo após 6 meses | Cliente sem atendimento há 6+ meses classificado como inativo |
| D-08 | No-show automático após 15 min | Rotina transacional com proteções: verificação atômica, idempotência, trilha de auditoria |

---

## 5. Restrições e Limites de Execução

- **Orçamento:** R$ 0,00 adicional. Proibido ativar billing, contratar serviços ou usar modelos pagos.
- **Nenhuma implementação de produto nesta fase.** Apenas especificação, planejamento, validação e preparação.
- **Não executar `specify init --force`.** Não substituir configurações funcionais existentes.
- **Backup obrigatório** antes de qualquer alteração em arquivos existentes.
- **OpenCode, Gemini CLI, Agy** participam somente se autenticados e operacionais.

---

## 6. Deliverables da Fase 0

1. `docs/SPEC.md` — Constituição (este documento)
2. `docs/specs/ESPECIFICACAO_FUNCIONAL_MVP.md` — Especificação funcional
3. `docs/specs/REQUISITOS_FUNCIONAIS_NAO_FUNCIONAIS.md` — Requisitos + critérios de aceitação
4. `docs/specs/REGRAS_NEGOCIO_APROVADAS.md` — Regras de negócio + matriz de rastreabilidade
5. `docs/specs/ARQUITETURA_TECNICA.md` — Arquitetura + modelo de dados conceitual
6. `docs/specs/ESTRATEGIA_AUTH_SEGURANCA.md` — Auth/autorização + segurança/LGPD
7. `docs/specs/ESTRATEGIA_NOTIFICACOES_TRANSACIONAL.md` — Notificações + transacional no-show
8. `docs/specs/PLANO_TESTES_RISCOS_IMPLEMENTACAO.md` — Plano de testes + riscos + plano de implementação
9. `docs/RELATORIO_MISSAO_08.md` — Relatório final da missão

---

## 7. Governança e Aprovação

Quaisquer mudanças a esta constituição requerem aprovação do Comandante. Decisões técnicas novas e indispensáveis devem ser documentadas e submetidas a aprovação antes de prosseguir.

---

⚓ **Navio Barber 2.0 — Navegar com evidências, construir com precisão.**