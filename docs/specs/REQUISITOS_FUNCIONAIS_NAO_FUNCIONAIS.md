# REQUISITOS_FUNCIONAIS_NAO_FUNCIONAIS.md — Requisitos e Critérios de Aceitação

**Versão:** 1.0  
**Data:** 2026-11-07  
**Autor:** Kilo Code (Orquestração: Aletheia v23)  
**Status:** Fase 0 — Spec Kit (especificação apenas, sem implementação)  
**Base:** REQUISITOS_FUNCIONAIS_MVP.md, ESPECIFICACAO_FUNCIONAL_MVP.md, DECISOES_DO_COMANDANTE.md

---

## 1. Requisitos Funcionais — Área do Barbeiro (P0)

### RF-BB-01: Dashboard do Barbeiro

**Descrição:** O barbeiro deve visualizar um dashboard com resumo do dia: agendamentos de hoje, clientes aguardando, receita prevista e taxa de ocupação.

**Critérios de aceitação:**
- [ ] Dashboard carrega em menos de 2 segundos
- [ ] Exibe pelo menos 4 cards de resumo (agendamentos hoje, clientes atendidos, receita do dia, ocupação)
- [ ] Lista próximos atendimentos (próximas 2 horas)
- [ ] Exibe alertas do sistema quando houver

**Prioridade:** P0  
**Evidência:** CONFIRMADA (parcial) — `/dashboard?user_id=59` com cards total_today, total_week, total_customers, alerts  
**Dependências:** Nenhuma (tela de entrada)

### RF-BB-02: Agenda Visual

**Descrição:** O barbeiro deve visualizar sua agenda em forma de calendário com slots de horário, diferenciando horários ocupados e disponíveis.

**Critérios de aceitação:**
- [ ] Visões: semana, dia e mês
- [ ] Blocos coloridos por status do agendamento
- [ ] Indicador de horário atual ("agora")
- [ ] Slots disponíveis clicáveis para novo agendamento
- [ ] Slots ocupados não clicáveis para novo agendamento
- [ ] Calendário mostra apenas até 30 dias à frente (D-05)

**Prioridade:** P0  
**Evidência:** CONFIRMADA — `/appointments` com hours[], free_spaces[], available flags, open_time, close_time  
**Dependências:** RF-BB-13 (horário de funcionamento afeta agenda)

### RF-BB-03: Cadastro de Serviços

**Descrição:** O barbeiro deve cadastrar, editar e inativar serviços com nome, categoria, preço, duração e comissão.

**Critérios de aceitação:**
- [ ] Nome, preço e duração são obrigatórios
- [ ] Duração mínima: 15 minutos
- [ ] Serviço inativo não aparece para agendamento novo
- [ ] Histórico de agendamentos com serviço inativo é preservado
- [ ] Preço é valor monetário positivo

**Prioridade:** P0  
**Evidência:** CONFIRMADA (parcial) — `services[]` observado em `/appointments`; duração_minutes:15 observado  
**Dependências:** Nenhuma

### RF-BB-04: Cadastro de Clientes

**Descrição:** O barbeiro deve cadastrar, editar e visualizar clientes com nome, telefone, email, data de nascimento, preferências e observações.

**Critérios de aceitação:**
- [ ] Nome e telefone são obrigatórios
- [ ] Telefone deve ser único na base
- [ ] Histórico de atendimentos do cliente é visível
- [ ] Cliente pode ser marcado como novo, ativo, inativo ou bloqueado
- [ ] Cliente inativo/bloqueado não pode ser selecionado em novo agendamento (D-06, D-07)

**Prioridade:** P0  
**Evidência:** CONFIRMADA (parcial) — `/customers?company_id=24` com body: id, full_name, is_active, email, phone, criado_em  
**Dependências:** Nenhuma

### RF-BB-05: Novo Agendamento

**Descrição:** O barbeiro deve criar um novo agendamento selecionando cliente, serviço(s), data e horário, com confirmação do resumo.

**Critérios de aceitação:**
- [ ] Fluxo multi-etapa: cliente → serviço → horário → confirmação
- [ ] Validação de horário disponível (não ocupado por outro agendamento)
- [ ] Validação de horário dentro do expediente (open_time/close_time)
- [ ] Validação de antecedência mínima: não permite agendar para < 2 horas (D-04)
- [ ] Validação de antecedência máxima: não permite agendar para > 30 dias (D-05)
- [ ] Cálculo automático de duração total e preço total
- [ ] Prevenção de dois clientes ocuparem o mesmo horário (validação de concorrência)
- [ ] Opção de envio de confirmação automática (push)

**Prioridade:** P0  
**Evidência:** CONFIRMADA (parcial) — estrutura de agendamento observada em `/appointments`  
**Dependências:** RF-BB-03, RF-BB-04, RF-BB-02

### RF-BB-06: Controle de Atendimento

**Descrição:** O barbeiro deve iniciar, concluir e marcar como ausente um atendimento, com registro de pagamento e observações.

**Critérios de aceitação:**
- [ ] Status do atendimento: aguardando → em andamento → concluído
- [ ] Forma de pagamento obrigatória ao concluir (dinheiro, cartão, PIX, voucher)
- [ ] Campo de observações livre
- [ ] Marcar como ausente libera o horário
- [ ] Registro de data/hora de início e conclusão

**Prioridade:** P0  
**Evidência:** CONFIRMADA (parcial) — status:"cancelado_barbeiro" observado; lunchPeriod estrutura confirmada  
**Dependências:** RF-BB-05

### RF-BB-07: Cancelamento e Remarcação

**Descrição:** O barbeiro deve cancelar ou remarcar agendamentos futuros, com registro de motivo e liberação do horário.

**Critérios de aceitação:**
- [ ] Só pode cancelar agendamentos "agendado" ou "confirmado"
- [ ] Registro de motivo do cancelamento
- [ ] Remarcação valida disponibilidade do novo horário
- [ ] Liberação do horário ao cancelar/remarcar
- [ ] Notificação automática ao cliente (push, se configurado)

**Prioridade:** P0  
**Evidência:** CONFIRMADA (parcial) — status:"cancelado_barbeiro" observado  
**Dependências:** RF-BB-05

---

## 2. Requisitos Funcionais — Área do Barbeiro (P1)

### RF-BB-08: Configurações da Barbearia

**Descrição:** O barbeiro deve configurar dados do estabelecimento, horário de funcionamento, preferências de notificação e perfil pessoal.

**Critérios de aceitação:**
- [ ] Nome, endereço, telefone, email da barbearia
- [ ] Horário de abertura/fechamento por dia da semana
- [ ] Dias marcados como fechado não geram slots
- [ ] Intervalo de almoço (início, fim, duração)
- [ ] Toggle para cada tipo de notificação automática

**Prioridade:** P1  
**Evidência:** CONFIRMADA (parcial) — setup-status confirma steps; open_time, close_time observados  
**Dependências:** RF-BB-02 (horário afeta agenda)

### RF-BB-09: Caixa e Comissões (Pagamento Presencial)

**Descrição:** O barbeiro deve visualizar recebimentos do dia/semana/mês e comissões a receber, registrando pagamentos presenciais.

**Critérios de aceitação:**
- [ ] Resumo de recebíveis por período
- [ ] Detalhamento por forma de pagamento (dinheiro, cartão, PIX, voucher)
- [ ] Comissão calculada conforme configuração do serviço
- [ ] Registro de pagamento presencial ao concluir atendimento
- [ ] Sem integração com pagamento online (D-01)

**Prioridade:** P1  
**Evidência:** CONFIRMADA (parcial) — max_employees e preço do plano confirmados; PIX e cartão confirmados via Mercado Pago  
**Dependências:** RF-BB-06 (pagamento registrado)

---

## 3. Requisitos Funcionais — Transversais (P0)

### RF-TR-01: Autenticação do Barbeiro

**Descrição:** O barbeiro deve autenticar-se no sistema com email/telefone e senha.

**Critérios de aceitação:**
- [ ] Tela de login com validação de credenciais
- [ ] Sessão persistente após login
- [ ] Redirecionamento para dashboard após autenticação
- [ ] Logout encerra a sessão

**Prioridade:** P0  
**Evidência:** CONFIRMADA (parcial) — `GET /auth/me` com body capturado  
**Dependências:** Nenhuma

### RF-TR-02: Notificações Push (FCM)

**Descrição:** O sistema deve enviar notificações push para eventos de agendamento via Firebase Cloud Messaging.

**Critérios de aceitação:**
- [ ] Registro de token FCM do dispositivo do barbeiro
- [ ] Notificação de novo agendamento (barbeiro e cliente)
- [ ] Notificação de cancelamento de agendamento (barbeiro e cliente)
- [ ] Notificação de remarcação de agendamento (barbeiro e cliente)
- [ ] Notificação de lembrete (configurável)
- [ ] Listagem de notificações com marcação de leitura
- [ ] Tratamento de falha de entrega (token inválido, dispositivo sem app)
- [ ] Limitação documentada: clientes sem app instalado ou que negaram permissão não recebem push

**Prioridade:** P0  
**Evidência:** CONFIRMADA — `POST /fcm-token` com body capturado; `GET /notifications` com body capturado  
**Dependências:** RF-TR-01 (sessão do barbeiro)

### RF-TR-03: Controle de Acesso por Papel (RBAC)

**Descrição:** O sistema deve distinguir permissões entre barbeiro e admin.

**Critérios de aceitação:**
- [ ] Barbeiro acessa apenas sua própria agenda e clientes
- [ ] Admin acessa configurações, profissionais, planos e relatórios
- [ ] Separação de responsabilidades definida por papel

**Prioridade:** P1  
**Evidência:** INFERÊNCIA — sem dado de permissões no HAR  
**Dependências:** RF-TR-01

---

## 4. Requisitos Não Funcionais (MVP)

### RNF-01: Performance

**Descrição:** Telas carregam rapidamente mesmo em conexão limitada.

**Critérios de aceitação:**
- [ ] Telas carregam em menos de 2 segundos em conexão 3G
- [ ] API responde em menos de 500ms para 95% das requisições

### RNF-02: Disponibilidade

**Descrição:** O sistema deve estar disponível durante o horário de funcionamento da barbearia.

**Critérios de aceitação:**
- [ ] Sistema disponível 99% do tempo durante horário de funcionamento
- [ ] Backup automático diário configurável

### RNF-03: Segurança

**Descrição:** Dados do usuário e da barbearia estão protegidos.

**Critérios de aceitação:**
- [ ] Senhas hashadas (não armazenadas em texto puro)
- [ ] Dados pessoais criptografados em repouso
- [ ] Tokens de sessão com expiração
- [ ] Acesso autenticado a todos os endpoints de dados

### RNF-04: Responsividade

**Descrição:** A interface funciona em mobile e desktop.

**Critérios de aceitação:**
- [ ] Interface funciona em navegadores mobile (Chrome, Safari)
- [ ] Interface funciona em desktop (Chrome, Firefox, Edge)
- [ ] Layout adaptável a diferentes tamanhos de tela

### RNF-05: LGPD

**Descrição:** O sistema está em conformidade com a Lei Geral de Proteção de Dados.

**Critérios de aceitação:**
- [ ] Consentimento para coleta de dados pessoais
- [ ] Direito ao esquecimento (exclusão de dados do cliente sob solicitação)
- [ ] Portabilidade de dados (exportação de dados do cliente)
- [ ] Trilha de auditoria de acessos a dados pessoais
- [ ] Documento `lgpd.md` criado e mantido

---

## 5. Requisitos Pendentes de Confirmação do Comandante

Estes requisitos foram identificados como dependentes de decisão do Comandante e estão registrados em `docs/DECISOES_DO_COMANDANTE.md`:

| ID | Requisito | Decisão Vinculante | Status |
|---|-----------|-------------------|--------|
| RF-PD-01 | Login do cliente obrigatório? | D-02: Não (apenas telefone) | Resolvido |
| RF-PD-02 | Pagamento online no MVP? | D-01: Não (apenas presencial) | Resolvido |
| RF-PD-03 | Canal de notificação prioritário? | D-03: Push (FCM) | Resolvido |
| RF-PD-04 | Antecedência mínima/máxima? | D-04: 2h; D-05: 30 dias | Resolvido |
| RF-PD-05 | Limite de no-shows para bloqueio? | D-06: 3 ocorrências | Resolvido |
| RF-PD-06 | Período de inatividade? | D-07: 6 meses | Resolvido |
| RF-PD-07 | Minutos para no-show automático? | D-08: 15 minutos | Resolvido |

---

## 6. Requisitos Excluídos do MVP (Fase 2+)

| ID | Descrição | Motivo |
|----|-----------|--------|
| RF-EX-01 | Marketing automatizado | Fase 2 |
| RF-EX-02 | Fidelidade com pontos e pacotes | Fase 2 |
| RF-EX-03 | Financeiro completo (fluxo de caixa, NF-e, comissões avançadas) | Fase 2 (versão simples no MVP) |
| RF-EX-04 | Analytics e BI dashboard | Fase 2 |
| RF-EX-05 | Multi-unidade | Fase 3 |
| RF-EX-06 | App mobile nativo | Fase 2 (PWA na web) |
| RF-EX-07 | Pagamento online integrado | Fase 2 (D-01: pagamento presencial no MVP) |
| RF-EX-08 | WhatsApp Business API integration | Fase 2 (notificações simples no MVP) |
| RF-EX-09 | PDV offline-first | Fase 4 |
| RF-EX-10 | Marketplace de profissionais | Fase 3 |

---

## 7. Matriz de Rastreabilidade — Requisito → Evidência → Decisão

| Requisito | Evidência (HAR/Documento) | Decisão Comandante | Nível de Confiança |
|-----------|--------------------------|-------------------|-------------------|
| RF-BB-01 | `/dashboard?user_id=59` | — | CONFIRMADA (parcial) |
| RF-BB-02 | `/appointments` (hours[], free_spaces[]) | D-05 (30 dias) | CONFIRMADA |
| RF-BB-03 | `services[]` em `/appointments` | — | CONFIRMADA (parcial) |
| RF-BB-04 | `/customers?company_id=24` | D-02, D-06, D-07 | CONFIRMADA (parcial) |
| RF-BB-05 | Estrutura de agendamento | D-04, D-05 | CONFIRMADA (parcial) |
| RF-BB-06 | `status:"cancelado_barbeiro"` | — | CONFIRMADA (parcial) |
| RF-BB-07 | `status:"cancelado_barbeiro"` | — | CONFIRMADA (parcial) |
| RF-BB-08 | setup-status steps; open_time/close_time | — | CONFIRMADA (parcial) |
| RF-BB-09 | PIX/cartão via Mercado Pago | D-01 | CONFIRMADA (parcial) |
| RF-TR-01 | `GET /auth/me` | — | CONFIRMADA (parcial) |
| RF-TR-02 | `POST /fcm-token`; `GET /notifications` | D-03 | CONFIRMADA |
| RF-TR-03 | Sem dado de RBAC no HAR | — | INFERÊNCIA |

---

⚓ **Navio Barber 2.0 — Navegar com evidências, construir com precisão.**