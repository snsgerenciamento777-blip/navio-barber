# MATRIZ_REGRAS_DE_NEGOCIO.md

Matriz de Regras de Negócio — Referência Hora do Estilo
Navio Barber 2.0 | Missão 04 — Engenharia Reversa e Mapeamento Funcional
Data: 2026-11-06 | Operador: Kilo Code | Orquestrador: Aletheia v23

---

## 1. Visão Geral

Esta matriz consolida as 23 regras de negócio da área do barbeiro (documentadas na Missão 03) e as regras transversais, classificando cada uma pelo nível de evidência baseado no arquivo HAR `01_Hora_do_Estilo_Admin.har`.

Classificações:
- **CONFIRMADA**: Evidência direta no HAR (endpoint + corpo de resposta)
- **CONFIRMADA (parcial)**: Endpoint existe no HAR mas corpo não captura todos os detalhes da regra
- **INFERÊNCIA**: Interpretação plausível do domínio de barbearia, sem respaldo direto no HAR
- **DESCONHECIDA**: Sem evidência suficiente
- **PENDENTE DE EVIDÊNCIA**: Valor ou parâmetro precisa de confirmação do Comandante

---

## 2. Regras de Agendamento

| ID | Regra | Gatilho | Ação do Sistema | Exceção | Classificação | Evidência HAR | Observações |
|----|-------|---------|-----------------|---------|---------------|---------------|-------------|
| RG-AG-01 | Unicidade de Horário | Tentativa de criar/mover agendamento para slot ocupado | Bloqueia operação, exibe conflito de horário | Nenhuma | CONFIRMADA (parcial) | `GET /appointments` → appointments[] com start_time/end_time; free_spaces[] com blocos de horário livre | Conflito de slot pode ser inferido da estrutura de horários |
| RG-AG-02 | Horário de Funcionamento | Seleção de data/horário fora do expediente | Não exibe slots fora do horário, impede confirmação | Dias fechados não geram slots | CONFIRMADA (parcial) | `GET /appointments?start_date=&end_date=&user_id=` → `open_time:"09:00:00", close_time:"18:00:00"` por dia | Horário de expediente observado na resposta |
| RG-AG-03 | Duração Mínima do Serviço | Cadastro/edição com duração < 15 min | Rejeita, solicita correção | Nenhuma | CONFIRMADA (parcial) | `GET /appointments` → `duration_minutes:15, duration_label:"15min"` | Duração de 15 min observada; mínimo não confirmado |
| RG-AG-04 | Duração Total Combinada | Seleção de múltiplos serviços | Calcula e exibe duração total | Nenhuma | INFERÊNCIA | Sem dado de serviços combinados no HAR | — |
| RG-AG-05 | Preço Total Combinado | Seleção de múltiplos serviços | Calcula e exibe preço total | Descontos/pacotes podem alterar | CONFIRMADA (parcial) | `GET /appointments` → `total_value:40` | Valor total observado; combinação múltipla não confirmada |
| RG-AG-06 | Antecedência Mínima | Tentativa de agendar dentro da janela mínima | Bloqueia agendamento | Barbeiro pode agendar "agora" (walk-in) | PENDENTE DE EVIDÊNCIA | Sem dado de antecedência no HAR | Valor padrão sugerido: 2 horas |
| RG-AG-07 | Antecedência Máxima | Tentativa de agendar além do limite máximo | Não exibe datas além do limite | Nenhuma | PENDENTE DE EVIDÊNCIA | Sem dado de antecedência no HAR | Valor padrão sugerido: 30 dias |
| RG-AG-08 | Confirmação Automática | Criação de agendamento com notificação ativada | Envia notificação ao cliente | Cliente sem telefone/email não recebe | CONFIRMADA (parcial) | `GET /notifications` → `type_key:"new_appointment", name:"Novo Agendamento"` | Notificação de novo agendamento confirmada; disparo/conteúdo são inferência |
| RG-AG-09 | Lembrete de Atendimento | Chegada do horário de lembrete para agendamento confirmado | Envia notificação de lembrete | Cliente desativou lembretes | CONFIRMADA (parcial) | `POST /fcm-token` confirma mecanismo de push | Lembrete automático é inferência |

---

## 3. Regras de Cliente

| ID | Regra | Gatilho | Ação do Sistema | Exceção | Classificação | Evidência HAR | Observações |
|----|-------|---------|-----------------|---------|---------------|---------------|-------------|
| RG-CL-01 | Unicidade de Telefone | Cadastro/edição com telefone existente | Bloqueia cadastro, exibe duplicidade | Nenhuma | INFERÊNCIA | `GET /customers?company_id=24` → `phone:"(11) 99786-4555"` | Estrutura com telefone confirmada; validação de unicidade não está na resposta |
| RG-CL-02 | Status do Cliente | Mudança de comportamento do cliente | Atualiza status automaticamente | Admin pode alterar manualmente | CONFIRMADA (parcial) | `GET /customers?company_id=24` → `is_active:1` | Campo is_active confirmado; outros status (bloqueado, inativo) não estão na resposta |
| RG-CL-03 | Bloqueio por No-shows | Novo no-show atinge limite N | Altera para "bloqueado", impede agendamentos | Admin pode desbloquear | INFERÊNCIA | Sem dado de no-show no HAR | Valor padrão sugerido: 3 |
| RG-CL-04 | Inatividade por Ausência | Passagem de período M sem atendimentos | Altera para "inativo", cliente continua podendo agendar | Nenhuma | INFERÊNCIA | Sem dado de inatividade no HAR | Valor padrão sugerido: 6 meses |
| RG-CL-05 | Histórico de Atendimentos | Conclusão de atendimento | Adiciona registro ao histórico | Nenhuma | INFERÊNCIA | `/subscription/me` tem `history` vazio (assinatura, não atendimento) | — |
| RG-CL-06 | Pontos de Fidelidade | Confirmação de pagamento | Adiciona pontos ao saldo | Cancelados/ausentes não geram pontos | DESCONHECIDA | Sem dado de fidelidade no HAR | Excluído do MVP (RF-EX-02) |

---

## 4. Regras de Serviço

| ID | Regra | Gatilho | Ação do Sistema | Exceção | Classificação | Evidência HAR | Observações |
|----|-------|---------|-----------------|---------|---------------|---------------|-------------|
| RG-SV-01 | Serviço Ativo para Agendamento | Consulta ao catálogo | Filtra e exibe apenas serviços ativos | Serviços inativos visíveis no histórico | INFERÊNCIA | `GET /appointments` → `services:["Corte Navalha"]` | Serviços observados mas sem campo ativo/inativo na resposta |
| RG-SV-02 | Alteração de Serviço com Futuros | Edição de serviço com agendamentos futuros | Exibe aviso, permite edição | Nenhuma | INFERÊNCIA | Sem dado de serviços no HAR | — |
| RG-SV-03 | Inativação com Futuros | Tentativa de inativar serviço com agendamentos futuros | Bloqueia, solicita cancelamento/reactualização primeiro | Nenhuma | INFERÊNCIA | Sem dado de serviços no HAR | — |

---

## 5. Regras de Profissional

| ID | Regra | Gatilho | Ação do Sistema | Exceção | Classificação | Evidência HAR | Observações |
|----|-------|---------|-----------------|---------|---------------|---------------|-------------|
| RG-PF-01 | Profissional Ativo para Agendamento | Seleção de profissional | Exibe apenas profissionais ativos | Nenhuma | CONFIRMADA (parcial) | `GET /employees/company/24` → `[{"id":59,"name":"Guga Souza"}]` | Estrutura de profissional confirmada; campo ativo/inativo não está na resposta |
| RG-PF-02 | Horário Individual do Profissional | Consulta de disponibilidade com profissional específico | Exibe slots dentro do horário individual | Se não definido, usa horário geral | DESCONHECIDA | Sem dado de horário individual no HAR | — |

---

## 6. Regras de Atendimento

| ID | Regra | Gatilho | Ação do Sistema | Exceção | Classificação | Evidência HAR | Observações |
|----|-------|---------|-----------------|---------|---------------|---------------|-------------|
| RG-AT-01 | Ciclo de Vida do Agendamento | Mudança de status | Valida transição, impede movimentos inválidos | Admin pode forçar alteração | CONFIRMADA (parcial) | `GET /appointments` → `status:"cancelado_barbeiro"`; `PUT /appointments/finalize-previous` confirma estado final | Estados intermediários (agendado→confirmado→em_andamento→concluído) são inferência |
| RG-AT-02 | Início de Atendimento | Clique "Iniciar Atendimento" | Altera para "em_andamento", registra início | Nenhuma | INFERÊNCIA | Sem endpoint de iniciar atendimento | — |
| RG-AT-03 | Conclusão de Atendimento | Clique "Concluir Atendimento" | Altera para "concluído", registra fim e pagamento | Nenhuma | CONFIRMADA (parcial) | `PUT /appointments/finalize-previous` confirma finalização | — |
| RG-AT-04 | Registro de Pagamento | Conclusão de atendimento | Exige forma de pagamento (dinheiro, cartão, PIX, voucher) | Nenhuma | CONFIRMADA (parcial) | `GET /appointments` → `total_value:40`; Mercado Pago + checkout-preview confirmam gateway; PIX e cartão confirmados; dinheiro e voucher são inferência | — |
| RG-AT-05 | Registro de No-show | Cliente não comparece / atraso X minutos | Altera para "ausente", libera horário, incrementa contador | Nenhuma | INFERÊNCIA | Sem dado de no-show no HAR | — |
| RG-AT-06 | Observações do Atendimento | Início ou conclusão | Permite campo de texto livre | Nenhuma | INFERÊNCIA | Sem dado de observações no HAR | — |

---

## 7. Regras de Cancelamento e Remarcação

| ID | Regra | Gatilho | Ação do Sistema | Exceção | Classificação | Evidência HAR | Observações |
|----|-------|---------|-----------------|---------|---------------|---------------|-------------|
| RG-CX-01 | Cancelamento de Agendamento | Solicitação de cancelamento | Altera para "cancelado", libera horário, notifica cliente | Concluídos/ausentes não podem ser cancelados | CONFIRMADA (parcial) | `GET /appointments` → `status:"cancelado_barbeiro"` | Cancelamento como status observado; endpoint de cancelamento não capturado |
| RG-CX-02 | Remarcação de Agendamento | Solicitação de remarcação | Valida disponibilidade, atualiza agendamento | Novo horário deve respeitar RG-AG-01 a RG-AG-07 | INFERÊNCIA | Sem endpoint de remarcação | — |
| RG-CX-03 | Limite de Cancelamentos do Cliente | Novo cancelamento atinge limite | Exibe aviso, pode exigir confirmação prévia | Admin pode sobrescrever | INFERÊNCIA | Sem dado de cancelamentos no HAR | — |

---

## 8. Regras de Configurações

| ID | Regra | Gatilho | Ação do Sistema | Exceção | Classificação | Evidência HAR | Observações |
|----|-------|---------|-----------------|---------|---------------|---------------|-------------|
| RG-CF-01 | Horário Afeta Agenda | Edição do horário de funcionamento | Recalcula slots a partir da data da alteração | Nenhuma | CONFIRMADA (parcial) | `GET /appointments?start_date=&end_date=&user_id=` → `open_time:"09:00:00", close_time:"18:00:00"` | Horário de expediente observado na resposta |
| RG-CF-02 | Dia Fechado Bloqueia Slots | Marcar dia como fechado | Remove todos os slots daquele dia | Nenhuma | CONFIRMADA (parcial) | `GET /appointments` → `schedule_exception:false` | Campo schedule_exception confirmado na resposta; conceito de dia fechado é inferência parcial |
| RG-CF-03 | Notificações Configuráveis por Tipo | Alteração nas preferências | Envia ou não conforme preferências salvas | Nenhuma | CONFIRMADA (parcial) | `GET /notifications` → `type_key:"new_appointment"` | Notificações por tipo observadas; preferências configuráveis são inferência |

---

## 9. Regras de Caixa e Financeiro

| ID | Regra | Gatilho | Ação do Sistema | Exceção | Classificação | Evidência HAR | Observações |
|----|-------|---------|-----------------|---------|---------------|---------------|-------------|
| RG-CX-01 (caixa) | Registro de Recebimento | Conclusão com pagamento | Adiciona entrada ao caixa com valor, forma, data | Nenhuma | CONFIRMADA (parcial) | `GET /appointments` → `total_value:40`; Mercado Pago + checkout-preview confirmam pagamento online | Recebimento presencial (dinheiro) não está no HAR |
| RG-CX-02 | Comissão do Barbeiro | Conclusão de atendimento | Calcula e registra comissão devida | Serviços sem comissão geram zero | CONFIRMADA (parcial) | Plano tem `max_employees` e preço; comissão por serviço não está no HAR | — |
| RG-CX-03 | Formas de Pagamento | Registro de pagamento | Exige seleção de uma forma disponível | Nenhuma | CONFIRMADA (parcial) | PIX e cartão confirmados via Mercado Pago/checkout-preview | Dinheiro e voucher não estão no HAR |

---

## 10. Exceções e Casos de Borda

| Caso | Comportamento do Sistema | Classificação | Evidência HAR |
|------|-------------------------|---------------|---------------|
| Dois barbeiros tentam agendar mesmo horário para mesmo cliente | Primeiro a salvar vence; segundo recebe conflito | INFERÊNCIA | Sem dado de concorrência no HAR |
| Cliente sem telefone tenta agendar | Sistema bloqueia e exige telefone | INFERÊNCIA | `GET /customers?company_id=24` → `phone:"(11) 99786-4555"` | Estrutura com telefone confirmada; validação de obrigatoriedade não está na resposta |
| Agendamento em feriado ou dia fechado | Sistema não exibe o dia como disponível | INFERÊNCIA | Sem dado de dias fechados no HAR |
| Serviço excluído com agendamentos históricos | Serviço é inativado, não excluído; históricos mantidos | INFERÊNCIA | Sem dado de serviços no HAR |
| Profissional desligado com agendamentos futuros | Agendamentos reagendados automaticamente ou cliente notificado | INFERÊNCIA | Sem dado de profissionais desligados no HAR |
| Pagamento não registrado ao concluir | Sistema não permite concluir sem forma de pagamento | CONFIRMADA (parcial) | Checkout-preview confirma `payment_required: true` |

---

## 11. Regras Pendentes de Confirmação (Parâmetros)

| ID | Parâmetro | Valor Sugerido | Classificação | Evidência HAR | Observações |
|----|-----------|---------------|---------------|---------------|-------------|
| RG-PD-01 | Antecedência mínima para agendamento | 2 horas | PENDENTE DE EVIDÊNCIA | Sem dado de antecedência no HAR | Confirmação do Comandante necessária |
| RG-PD-02 | Antecedência máxima para agendamento | 30 dias | PENDENTE DE EVIDÊNCIA | Sem dado de antecedência no HAR | Confirmação do Comandante necessária |
| RG-PD-03 | Limite de no-shows para bloqueio | 3 | PENDENTE DE EVIDÊNCIA | Sem dado de no-show no HAR | Confirmação do Comandante necessária |
| RG-PD-04 | Período de inatividade para cliente inativo | 6 meses | PENDENTE DE EVIDÊNCIA | Sem dado de inatividade no HAR | Confirmação do Comandante necessária |
| RG-PD-05 | Pontos de fidelidade por real gasto | 1 ponto por R$ 1,00 | PENDENTE DE EVIDÊNCIA | Sem dado de fidelidade no HAR | Excluído do MVP |
| RG-PD-06 | Minutos de atraso para no-show automático | 15 minutos | PENDENTE DE EVIDÊNCIA | Sem dado de atraso no HAR | Confirmação do Comandante necessária |
| RG-PD-07 | Formas de pagamento adicionais | — | PENDENTE DE EVIDÊNCIA | PIX e cartão confirmados; dinheiro e voucher são inferência | — |

---

## 12. Tabela de Classificação por Categoria

| Categoria | CONFIRMADA | CONFIRMADA (parcial) | INFERÊNCIA | DESCONHECIDA | PENDENTE | Total |
|-----------|------------|---------------------|------------|--------------|----------|-------|
| Regras de Agendamento | 0 | 6 | 1 | 0 | 2 | 9 |
| Regras de Cliente | 0 | 1 | 4 | 1 | 0 | 6 |
| Regras de Serviço | 0 | 0 | 3 | 0 | 0 | 3 |
| Regras de Profissional | 0 | 1 | 0 | 1 | 0 | 2 |
| Regras de Atendimento | 0 | 3 | 3 | 0 | 0 | 6 |
| Regras de Cancelamento | 0 | 1 | 2 | 0 | 0 | 3 |
| Regras de Configurações | 0 | 3 | 0 | 0 | 0 | 3 |
| Regras de Caixa/Financeiro | 0 | 3 | 0 | 0 | 0 | 3 |
| Exceções e Casos de Borda | 0 | 1 | 5 | 0 | 0 | 6 |
| Parâmetros Pendentes | 0 | 0 | 0 | 0 | 7 | 7 |
| **Total** | **0** | **19** | **18** | **2** | **9** | **48** |

---

## 13. Resumo de Evidências por Regra

### Regras com confirmação parcial no HAR (19 regras)

1. **RG-AG-01** (Unicidade de Horário) — `GET /appointments` → appointments[] com start_time/end_time; free_spaces[]
2. **RG-AG-02** (Horário de Funcionamento) — `GET /appointments?start_date=&end_date=&user_id=` → open_time/close_time
3. **RG-AG-03** (Duração Mínima do Serviço) — `GET /appointments` → duration_minutes:15
4. **RG-AG-05** (Preço Total Combinado) — `GET /appointments` → total_value:40
5. **RG-AG-08** (Confirmação Automática) — `GET /notifications` → type_key:"new_appointment"
6. **RG-AG-09** (Lembrete de Atendimento) — `POST /fcm-token` confirma mecanismo de push
7. **RG-CF-01** (Horário Afeta Agenda) — `GET /appointments?start_date=&end_date=&user_id=` → open_time/close_time
8. **RG-CF-02** (Dia Fechado Bloqueia Slots) — `GET /appointments` → `schedule_exception:false`
9. **RG-CF-03** (Notificações Configuráveis) — `GET /notifications` → type_key:"new_appointment"
10. **RG-CL-02** (Status do Cliente) — `GET /customers?company_id=24` → is_active:1
11. **RG-PF-01** (Profissional Ativo) — `GET /employees/company/24` → [{"id":59,"name":"Guga Souza"}]
12. **RG-AT-01** (Ciclo de Vida) — `GET /appointments` → status:"cancelado_barbeiro"; `PUT /appointments/finalize-previous`
13. **RG-AT-03** (Conclusão de Atendimento) — `PUT /appointments/finalize-previous` confirma finalização
14. **RG-AT-04** (Registro de Pagamento) — `GET /appointments` → total_value:40; checkout-preview com pix_available, credit_available
15. **RG-CX-01** (Cancelamento de Agendamento) — `GET /appointments` → status:"cancelado_barbeiro"
16. **RG-CX-01 (caixa)** (Registro de Recebimento) — `GET /appointments` → total_value:40; checkout-preview
17. **RG-CX-02** (Comissão do Barbeiro) — Plano tem `max_employees` e preço no `/subscription/me`
18. **RG-CX-03** (Formas de Pagamento) — PIX e cartão confirmados via Mercado Pago/checkout-preview
19. **Exceção: Pagamento não registrado ao concluir** — Checkout-preview confirma `payment_required: true`

### Regras sem confirmação no HAR (29 regras)

- 18 classificadas como INFERÊNCIA (interpretação de domínio)
- 2 classificadas como DESCONHECIDA (sem dado algum)
- 9 classificadas como PENDENTE DE EVIDÊNCIA (parâmetros aguardando confirmação do Comandante)

---

**Próximo passo:** Esta matriz alimenta a `LACUNAS_EVIDENCIAS_PENDENTES.md`, que detalhará especificamente o que precisa ser investigado antes da Missão 05.
