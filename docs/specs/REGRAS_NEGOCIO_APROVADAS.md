# REGRAS_NEGOCIO_APROVADAS.md — Regras de Negócio e Matriz de Rastreabilidade

**Versão:** 1.0  
**Data:** 2026-11-07  
**Autor:** Kilo Code (Orquestração: Aletheia v23)  
**Status:** Fase 0 — Spec Kit (especificação apenas, sem implementação)  
**Base:** MATRIZ_REGRAS_DE_NEGOCIO.md, DECISOES_DO_COMANDANTE.md, ESPECIFICACAO_FUNCIONAL_MVP.md

---

## 1. Regras de Negócio — Agendamento (RG-AG)

### RG-AG-01: Antecedência Mínima

**Descrição:** Não é permitido criar um agendamento para um horário com menos de 2 horas de antecedência a partir do momento atual.

**Origem:** Decisão D-04 do Comandante  
**Evidência:** Hipótese de domínio (não há dado direto no HAR)  
**Tipo:** Regra de validação (bloqueante)  
**Aplicação:** Tela de novo agendamento (RF-BB-05)  
**Critério de aceitação:** O sistema recusa agendamentos com data/hora < now + 2 horas e exibe mensagem informando a antecedência mínima.

### RG-AG-02: Antecedência Máxima

**Descrição:** Não é permitido criar um agendamento para um horário com mais de 30 dias de antecedência a partir do momento atual.

**Origem:** Decisão D-05 do Comandante  
**Evidência:** Hipótese de domínio (não há dado direto no HAR)  
**Tipo:** Regra de validação (bloqueante)  
**Aplicação:** Tela de novo agendamento (RF-BB-05), visualização de agenda (RF-BB-02)  
**Critério de aceitação:** O calendário não exibe slots além de 30 dias a partir de hoje. O sistema recusa agendamentos com data/hora > now + 30 dias.

### RG-AG-03: Disponibilidade de Slot

**Descrição:** Um slot de horário só pode ser agendado se estiver disponível (não ocupado por outro agendamento no mesmo profissional, serviço e horário).

**Origem:** Evidência do HAR — `/appointments` com `available` flag e `free_spaces[]`  
**Tipo:** Regra de integridade (bloqueante)  
**Aplicação:** Novo agendamento (RF-BB-05), remarcação (RF-BB-07)  
**Critério de aceitação:** O sistema verifica disponibilidade antes de confirmar o agendamento. Dois clientes não podem ocupar o mesmo horário.

### RG-AG-04: Horário dentro do Expediente

**Descrição:** O agendamento só pode ser criado dentro do horário de funcionamento configurado para o dia da semana.

**Origem:** Evidência do HAR — `open_time`, `close_time` em `/appointments`  
**Tipo:** Regra de validação (bloqueante)  
**Aplicação:** Novo agendamento (RF-BB-05)  
**Critério de aceitação:** O sistema rejeita agendamentos fora do open_time/close_time do dia selecionado.

### RG-AG-05: Dia Fechado Sem Slots

**Descrição:** Dias marcados como fechados (schedule_exception) não geram slots de agendamento.

**Origem:** Evidência do HAR — `schedule_exception:false` em `/appointments`  
**Tipo:** Regra de negócio  
**Aplicação:** Visualização de agenda (RF-BB-02), configurações (RF-BB-08)  
**Critério de aceitação:** Dias fechados aparecem bloqueados na agenda, sem slots clicáveis.

### RG-AG-06: Intervalo de Almoço

**Descrição:** Durante o intervalo de almoço configurado (lunchPeriod), nenhum slot é gerado.

**Origem:** Evidência do HAR — `lunchPeriod` estrutura em `/appointments`  
**Tipo:** Regra de negócio  
**Aplicação:** Visualização de agenda (RF-BB-02)  
**Critério de aceitação:** Slots não são exibidos durante o intervalo de almoço configurado.

### RG-AG-07: Cancelamento de Agendamentos Válidos

**Descrição:** Só é permitido cancelar agendamentos com status "agendado" ou "confirmado".

**Origem:** Evidência do HAR — `status:"cancelado_barbeiro"` em `/appointments`  
**Tipo:** Regra de validação  
**Aplicação:** Cancelamento/remarcação (RF-BB-07)  
**Critério de aceitação:** O sistema bloqueia cancelamento de agendamentos já concluídos, ausentes ou cancelados. Ao cancelar, o horário é liberado.

---

## 2. Regras de Negócio — Atendimento (RG-AT)

### RG-AT-01: Ciclo de Vida do Atendimento

**Descrição:** O atendimento segue o fluxo: aguardando → em andamento → concluído.

**Origem:** Inferência parcial (status intermediários não confirmados no HAR)  
**Tipo:** Regra de fluxo  
**Aplicação:** Controle de atendimento (RF-BB-06)  
**Critério de aceitação:** O sistema permite transição apenas nos estados definidos. Não é possível pular estados.

### RG-AT-02: Pagamento Obrigatório na Conclusão

**Descrição:** Ao concluir um atendimento, é obrigatório registrar a forma de pagamento.

**Origem:** Evidência parcial — PIX e cartão confirmados via Mercado Pago; dinheiro e voucher não confirmados  
**Tipo:** Regra de validação (bloqueante)  
**Aplicação:** Controle de atendimento (RF-BB-06)  
**Critério de aceitação:** O sistema não permite concluir atendimento sem selecionar forma de pagamento (dinheiro, cartão, PIX, voucher).

### RG-AT-03: Ausência Libera Horário

**Descrição:** Marcar um atendimento como ausente (no-show) libera o horário para novo agendamento.

**Origem:** Evidência parcial — `status:"cancelado_barbeiro"` observado  
**Tipo:** Regra de negócio  
**Aplicação:** Controle de atendimento (RF-BB-06)  
**Critério de aceitação:** Ao marcar como ausente, o slot fica disponível para novo agendamento.

---

## 3. Regras de Negócio — Cliente (RG-CL)

### RG-CL-01: Telefone Único

**Descrição:** O telefone do cliente deve ser único na base de dados.

**Origem:** Evidência parcial — `/customers` com `phone` confirmado; unicidade não confirmada no HAR  
**Tipo:** Regra de integridade  
**Aplicação:** Cadastro de clientes (RF-BB-04)  
**Critério de aceitação:** O sistema rejeita cadastro de cliente com telefone já existente.

### RG-CL-02: Status do Cliente

**Descrição:** O cliente pode ter status: novo, ativo, inativo, bloqueado.

**Origem:** Evidência parcial — `is_active:1` confirmado; outros status são inferência  
**Tipo:** Regra de classificação  
**Aplicação:** Cadastro de clientes (RF-BB-04)  
**Critério de aceitação:** O sistema permite marcar cliente como novo, ativo, inativo ou bloqueado.

### RG-CL-03: Bloqueio por No-Show

**Descrição:** Após 3 no-shows (faltas sem aviso), o cliente é bloqueado para novos agendamentos.

**Origem:** Decisão D-06 do Comandante  
**Tipo:** Regra de negócio (bloqueante)  
**Aplicação:** Cadastro de clientes (RF-BB-04), novo agendamento (RF-BB-05)  
**Critério de aceitação:** Clientes com 3 ou mais no-shows não podem ser selecionados em novo agendamento. Apenas o barbeiro pode desbloquear manualmente.

### RG-CL-04: Cliente Inativo

**Descrição:** Cliente sem atendimento há 6 meses é classificado como inativo.

**Origem:** Decisão D-07 do Comandante  
**Tipo:** Regra de classificação  
**Aplicação:** Cadastro de clientes (RF-BB-04)  
**Critério de aceitação:** O sistema identifica clientes inativos (6+ meses sem atendimento) e os marca como inativos. Clientes inativos ainda podem marcar novos horários.

---

## 4. Regras de Negócio — No-Show Automático (RG-NS)

### RG-NS-01: Limite de Atraso para No-Show

**Descrição:** Após 15 minutos de atraso do horário marcado, o agendamento pode ser considerado automaticamente como no-show.

**Origem:** Decisão D-08 do Comandante  
**Tipo:** Regra de negócio (transacional)  
**Aplicação:** Rotina automática de no-show  
**Critério de aceitação:** Se o cliente não comparecer após 15 minutos do horário, o sistema pode encerrar o agendamento como no-show e liberar o horário.

### RG-NS-02: Verificação de Estado Antes do No-Show

**Descrição:** Antes de marcar um agendamento como no-show, o sistema deve verificar que o agendamento ainda está válido (não cancelado, concluído ou remarcado).

**Origem:** Especificação da Missão 08 (proteção transacional)  
**Tipo:** Regra de proteção transacional (obrigatória)  
**Aplicação:** Rotina automática de no-show  
**Critério de aceitação:** A rotina de no-show verifica o estado atual do agendamento imediatamente antes da alteração. Se o agendamento não estiver mais em estado "aguardando" ou "confirmado", a rotina não altera nada.

### RG-NS-03: Operação Atômica

**Descrição:** A operação de no-show deve ser atômica ou equivalente, impedindo alterações concorrentes.

**Origem:** Especificação da Missão 08 (proteção transacional)  
**Tipo:** Regra de proteção transacional (obrigatória)  
**Aplicação:** Rotina automática de no-show  
**Critério de aceitação:** Duas execuções concorrentes da rotina de no-show para o mesmo agendamento resultam em apenas uma alteração efetiva.

### RG-NS-04: Idempotência

**Descrição:** Executar a rotina de no-show repetidamente para o mesmo agendamento não gera faltas duplicadas.

**Origem:** Especificação da Missão 08 (proteção transacional)  
**Tipo:** Regra de proteção transacional (obrigatória)  
**Aplicação:** Rotina automática de no-show  
**Critério de aceitação:** A rotina pode ser executada múltiplas vezes para o mesmo agendamento sem criar registros de no-show duplicados.

### RG-NS-05: Não Sobrescrever Alteração Mais Recente

**Descrição:** A rotina de no-show não pode sobrescrever uma alteração mais recente no agendamento.

**Origem:** Especificação da Missão 08 (proteção transacional)  
**Tipo:** Regra de proteção transacional (obrigatória)  
**Aplicação:** Rotina automática de no-show  
**Critério de aceitação:** Se o agendamento foi modificado após o horário marcado (ex: remarcado), a rotina de no-show não altera o status.

### RG-NS-06: Registro de Auditoria

**Descrição:** Toda alteração de status por no-show deve registrar data, horário, motivo e origem da alteração.

**Origem:** Especificação da Missão 08 (proteção transacional)  
**Tipo:** Regra de auditoria  
**Aplicação:** Rotina automática de no-show  
**Critério de aceitação:** Cada no-show automático gera um registro de auditoria com timestamp, motivo ("no-show_automatico") e origem ("sistema" ou "manual").

### RG-NS-07: Intervenção Manual

**Descrição:** O barbeiro pode intervir manualmente para desfazer ou modificar um no-show automático.

**Origem:** Especificação da Missão 08 (proteção transacional)  
**Tipo:** Regra de negócio  
**Aplicação:** Rotina automática de no-show  
**Critério de aceitação:** O barbeiro pode reabrir um agendamento encerrado como no-show, desde que o horário ainda não tenha sido ocupado por outro agendamento.

### RG-NS-08: Comportamento em Indisponibilidade

**Descrição:** Quando houver atraso de processamento ou indisponibilidade do sistema, a rotina de no-show não deve falhar silenciosamente.

**Origem:** Especificação da Missão 08 (proteção transacional)  
**Tipo:** Regra de resiliência  
**Aplicação:** Rotina automática de no-show  
**Critério de aceitação:** A rotina registra falhas e tenta novamente em momento posterior. Não deixa agendamentos em estado indefinido.

---

## 5. Regras de Negócio — Notificações (RG-NT)

### RG-NT-01: Canal Prioritário

**Descrição:** Push (FCM) é o único canal de notificação confirmado para o MVP.

**Origem:** Decisão D-03 do Comandante; evidência do HAR — `POST /fcm-token`  
**Tipo:** Regra de negócio  
**Aplicação:** Notificações (RF-TR-02)  
**Critério de aceitação:** O sistema usa exclusivamente FCM para notificações push. WhatsApp, email e SMS estão fora do escopo do MVP.

### RG-NT-02: Eventos Notificados

**Descrição:** Notificações são disparadas para: novo agendamento, cancelamento, remarcação e lembrete.

**Origem:** Evidência do HAR — `GET /notifications` com `type_key:"new_appointment"`  
**Tipo:** Regra de negócio  
**Aplicação:** Notificações (RF-TR-02)  
**Critério de aceitação:** Cada evento gera uma notificação push com tipo identificável.

### RG-NT-03: Destinatários

**Descrição:** Notificações são enviadas para barbeiro e cliente (quando aplicável).

**Origem:** Inferência parcial  
**Tipo:** Regra de negócio  
**Aplicação:** Notificações (RF-TR-02)  
**Critério de aceitação:** Novo agendamento, cancelamento e remarcação notificam tanto o barbeiro quanto o cliente. Lembretes notificam o cliente.

### RG-NT-04: Clientes sem Dispositivo Registrado

**Descrição:** Clientes sem aplicativo instalado, que negaram permissão ou com token inválido não recebem notificações push.

**Origem:** Especificação da Missão 08 (limitação documentada)  
**Tipo:** Regra de limitação  
**Aplicação:** Notificações (RF-TR-02)  
**Critério de aceitação:** O sistema não promete entrega de push para clientes sem dispositivo registrado. Essa limitação está documentada como requisito pendente.

---

## 6. Regras de Negócio — Financeiro (RG-FN)

### RG-FN-01: Pagamento Presencial Apenas

**Descrição:** O MVP registra apenas pagamentos presenciais (dinheiro, cartão, PIX, voucher). Não há pagamento online.

**Origem:** Decisão D-01 do Comandante  
**Tipo:** Regra de negócio (restritiva)  
**Aplicação:** Caixa e comissões (RF-BB-09)  
**Critério de aceitação:** O sistema não oferece checkout online nem integração com Mercado Pago para cobrança.

### RG-FN-02: Comissão por Serviço

**Descrição:** A comissão do barbeiro é calculada conforme configuração do serviço.

**Origem:** Evidência parcial — `max_employees` e preço do plano confirmados; comissão por serviço não está no HAR  
**Tipo:** Regra de cálculo  
**Aplicação:** Caixa e comissões (RF-BB-09)  
**Critério de aceitação:** Cada serviço pode ter comissão configurada; o cálculo é aplicado ao concluir o atendimento.

---

## 7. Matriz de Rastreabilidade — Evidência → Decisão → Requisito → Regra de Negócio

| Evidência (HAR) | Decisão Comandante | Requisito(s) | Regra(s) de Negócio | Nível de Confiança |
|-----------------|-------------------|--------------|---------------------|-------------------|
| `GET /auth/me` | — | RF-TR-01 | — | CONFIRMADA (parcial) |
| `GET /my-profile` | — | RF-BB-02 | — | CONFIRMADA |
| `GET /dashboard?user_id=59` | — | RF-BB-01 | — | CONFIRMADA (parcial) |
| `GET /appointments` | D-04, D-05 | RF-BB-02, RF-BB-05 | RG-AG-01 a RG-AG-07 | CONFIRMADA |
| `PUT /appointments/finalize-previous` | — | RF-BB-06 | RG-AT-01 | CONFIRMADA |
| `GET /customers?company_id=24` | D-02, D-06, D-07 | RF-BB-04 | RG-CL-01 a RG-CL-04 | CONFIRMADA (parcial) |
| `GET /employees/company/24` | — | RF-BB-08 (P1) | — | CONFIRMADA (parcial) |
| `GET /employees/company/24/select` | — | RF-TR-03 (base) | — | CONFIRMADA |
| `GET /subscriptions/plans` | D-01 | RF-BB-10 (P1) | RG-FN-01 | CONFIRMADA |
| `GET /subscription/me` | D-01 | RF-BB-10 (P1) | RG-FN-01 | CONFIRMADA |
| `POST /fcm-token` | D-03 | RF-TR-02 | RG-NT-01 a RG-NT-04 | CONFIRMADA |
| `GET /notifications` | D-03 | RF-TR-02 | RG-NT-02 a RG-NT-04 | CONFIRMADA |
| `GET /dashboard/setup-status` | — | RF-BB-11 | — | CONFIRMADA |
| `GET /employee-absences` | — | RF-BB-19 | RG-AG-05 | CONFIRMADA |
| `GET /packages-sold` | — | RF-BB-20 | — | CONFIRMADA |
| Sem dado de RBAC no HAR | — | RF-TR-03 | — | INFERÊNCIA |
| Sem dado de no-show no HAR | D-06, D-08 | RF-BB-06 | RG-NS-01 a RG-NS-08 | DECISÃO DO COMANDANTE |
| Sem dado de antecedência no HAR | D-04, D-05 | RF-BB-05 | RG-AG-01, RG-AG-02 | DECISÃO DO COMANDANTE |

---

## 8. Regras Pendentes de Validação

Estas regras são inferências ou decisões do Comandante que precisam ser validadas durante a implementação:

| ID | Regra | Status | Motivo da Pendência |
|----|-------|--------|-------------------|
| RG-PD-01 | Unicidade de telefone do cliente | Pendente | Não confirmado no HAR |
| RG-PD-02 | Estados intermediários do agendamento | Pendente | Não capturados no HAR |
| RG-PD-03 | Modelo de comissão por serviço | Pendente | Não está no HAR |
| RG-PD-04 | Dinheiro e voucher como formas de pagamento | Pendente | Não confirmados no HAR |
| RG-PD-05 | Regras de disparo de notificações | Pendente | Conteúdo completo não capturado |

---

⚓ **Navio Barber 2.0 — Navegar com evidências, construir com precisão.**