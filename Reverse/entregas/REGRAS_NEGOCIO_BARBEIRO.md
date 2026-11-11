# REGRAS_NEGOCIO_BARBEIRO.md

Regras de Negócio — Área do Barbeiro
Navio Barber 2.0 | Missão 03 — Engenharia Reversa Funcional
Data: 2026-11-06 | Status: Especificação funcional (não implementação)

---

## 1. Visão Geral

Este documento consolida todas as regras de negócio da área do barbeiro, organizadas
por domínio: agendamento, cliente, serviço, profissional, atendimento, cancelamento,
configurações e caixa. Especificação funcional original, sem cópia de nenhum sistema
concorrente.

Cada regra inclui: ID, descrição, condição de gatilho, ação do sistema e exceções.

---

## 2. Regras de Agendamento

### RG-AG-01: Unicidade de Horário
**Descrição:** Não é permitido criar dois agendamentos no mesmo horário para o mesmo profissional.
**Gatilho:** Tentativa de criar ou mover agendamento para um slot já ocupado.
**Ação:** Sistema bloqueia a operação e exibe mensagem de conflito de horário.
**Exceção:** Nenhuma.

### RG-AG-02: Horário de Funcionamento
**Descrição:** Agendamentos só podem ser criados dentro do horário de funcionamento definido para cada dia da semana.
**Gatilho:** Seleção de data/horário fora do expediente.
**Ação:** Sistema não exibe slots fora do horário e impede a confirmação.
**Exceção:** Dias marcados como "fechado" não geram nenhum slot.

### RG-AG-03: Duração Mínima do Serviço
**Descrição:** Cada serviço tem duração mínima de 15 minutos.
**Gatilho:** Cadastro ou edição de serviço com duração abaixo de 15 min.
**Ação:** Sistema rejeita e solicita correção.
**Exceção:** Nenhuma.

### RG-AG-04: Duração Total de Agendamento Combinado
**Descrição:** Quando múltiplos serviços são selecionados em um único agendamento, a duração total é a soma das durações individuais.
**Gatilho:** Seleção de mais de um serviço no agendamento.
**Ação:** Sistema calcula e exibe a duração total antes da confirmação do horário.
**Exceção:** Nenhuma.

### RG-AG-05: Preço Total de Agendamento Combinado
**Descrição:** O preço total é a soma dos preços de todos os serviços selecionados.
**Gatilho:** Seleção de múltiplos serviços.
**Ação:** Sistema calcula e exibe o preço total no resumo do agendamento.
**Exceção:** Descontos ou pacotes promocionais podem alterar esta regra (pendente de definição).

### RG-AG-06: Antecedência Mínima para Agendamento
**Descrição:** Agendamentos só podem ser feitos com, no mínimo, X horas de antecedência (valor configurável, padrão: 2 horas).
**Gatilho:** Tentativa de agendar para horário dentro da janela de antecedência mínima.
**Ação:** Sistema bloqueia o agendamento.
**Exceção:** Barbeiro pode agendar diretamente para "agora" (atendimento walk-in) se houver slot livre.

### RG-AG-07: Antecedência Máxima para Agendamento
**Descrição:** Agendamentos só podem ser feitos com, no máximo, Y dias de antecedência (valor configurável, padrão: 30 dias).
**Gatilho:** Tentativa de agendar além do limite máximo.
**Ação:** Sistema não exibe datas além do limite.
**Exceção:** Nenhuma.

### RG-AG-08: Confirmação Automática
**Descrição:** Quando ativada, o sistema envia confirmação automática (WhatsApp/email/SMS) ao cliente após a criação do agendamento.
**Gatilho:** Criação de agendamento com notificação ativada nas configurações.
**Ação:** Sistema envia notificação ao cliente com detalhes do agendamento.
**Exceção:** Cliente sem telefone/email cadastrado não recebe notificação.

### RG-AG-09: Lembrete de Atendimento
**Descrição:** Sistema envia lembrete automático ao cliente X horas antes do agendamento (configurável, padrão: 24 horas).
**Gatilho:** Chegada do horário de lembrete para um agendamento confirmado.
**Ação:** Sistema envia notificação de lembrete.
**Exceção:** Cliente desativou lembretes nas configurações.

---

## 3. Regras de Cliente

### RG-CL-01: Unicidade de Telefone
**Descrição:** O telefone é campo obrigatório e deve ser único na base de clientes.
**Gatilho:** Cadastro ou edição de cliente com telefone já existente.
**Ação:** Sistema bloqueia o cadastro e exibe mensagem de duplicidade.
**Exceção:** Nenhuma.

### RG-CL-02: Status do Cliente
**Descrição:** Cliente pode estar nos estados: novo, ativo, inativo, bloqueado.
**Gatilho:** Mudança de comportamento do cliente (atendimentos, no-shows).
**Ação:** Sistema atualiza o status automaticamente com base nas regras abaixo.
**Exceção:** Admin pode alterar status manualmente.

### RG-CL-03: Cliente Bloqueado por No-shows
**Descrição:** Cliente com N ou mais no-shows consecutivos é automaticamente bloqueado (valor configurável, padrão: 3).
**Gatilho:** Registro de novo no-show que atinge o limite.
**Ação:** Sistema altera status para "bloqueado" e impede novos agendamentos até revisão manual.
**Exceção:** Admin pode desbloquear manualmente.

### RG-CL-04: Cliente Inativo por Ausência
**Descrição:** Cliente sem atendimentos concluídos há M meses é automaticamente marcado como inativo (valor configurável, padrão: 6 meses).
**Gatilho:** Passagem do período de inatividade.
**Ação:** Sistema altera status para "inativo". Cliente continua podendo agendar.
**Exceção:** Nenhuma.

### RG-CL-05: Histórico de Atendimentos
**Descrição:** Todo atendimento concluído é registrado no histórico do cliente com serviço, profissional, data, valor e status.
**Gatilho:** Conclusão de atendimento.
**Ação:** Sistema adiciona registro ao histórico do cliente.
**Exceção:** Nenhuma.

### RG-CL-06: Pontos de Fidelidade
**Descrição:** Cliente acumula pontos a cada atendimento concluído (valor configurável, padrão: 1 ponto por real gasto).
**Gatilho:** Confirmação de pagamento do atendimento.
**Ação:** Sistema adiciona pontos ao saldo do cliente.
**Exceção:** Agendamentos cancelados ou ausentes não geram pontos.

---

## 4. Regras de Serviço

### RG-SV-01: Serviço Ativo para Agendamento
**Descrição:** Apenas serviços com status "ativo" aparecem no catálogo para agendamento.
**Gatilho:** Consulta ao catálogo de serviços.
**Ação:** Sistema filtra e exibe apenas serviços ativos.
**Exceção:** Serviços inativos continuam visíveis no histórico de atendimentos passados.

### RG-SV-02: Alteração de Serviço com Agendamentos Futuro
**Descrição:** Alterar preço ou duração de um serviço afeta apenas novos agendamentos; agendamentos futuros já criados mantêm os valores originais.
**Gatilho:** Edição de serviço com agendamentos futuros vinculados.
**Ação:** Sistema exibe aviso sobre quantidade de agendamentos afetados e permite a edição.
**Exceção:** Nenhuma.

### RG-SV-03: Inativação de Serviço com Agendamentos Futuro
**Descrição:** Não é permitido inativar um serviço que tenha agendamentos futuros agendados.
**Gatilho:** Tentativa de inativar serviço com agendamentos futuros.
**Ação:** Sistema bloqueia e solicita cancelamento ou reagendamento dos agendamentos vinculados primeiro.
**Exceção:** Nenhuma.

---

## 5. Regras de Profissional

### RG-PF-01: Disponibilidade do Profissional
**Descrição:** Apenas profissionais com status "ativo" aparecem como opção de agendamento.
**Gatilho:** Seleção de profissional no agendamento.
**Ação:** Sistema exibe apenas profissionais ativos.
**Exceção:** Nenhuma.

### RG-PF-02: Horário Individual do Profissional
**Descrição:** Cada profissional pode ter seu próprio horário de trabalho, que sobrepõe o horário geral da barbearia.
**Gatilho:** Consulta de disponibilidade para agendamento com profissional específico.
**Ação:** Sistema exibe slots apenas dentro do horário individual do profissional.
**Exceção:** Se o profissional não tiver horário individual definido, usa o horário geral da barbearia.

---

## 6. Regras de Atendimento

### RG-AT-01: Ciclo de Vida do Agendamento
**Descrição:** Um agendamento segue os estados: agendado → confirmado → em_andamento → concluído, podendo desviar para cancelado ou ausente em qualquer ponto antes da conclusão.
**Gatilho:** Mudança de status pelo barbeiro ou sistema.
**Ação:** Sistema valida a transição de estado e impede movimentos inválidos.
**Exceção:** Admin pode forçar alteração de estado.

### RG-AT-02: Início de Atendimento
**Descrição:** Só é possível iniciar atendimento para agendamentos com status "agendado" ou "confirmado".
**Gatilho:** Clique em "Iniciar Atendimento".
**Ação:** Sistema altera status para "em_andamento" e registra o horário de início.
**Exceção:** Nenhuma.

### RG-AT-03: Conclusão de Atendimento
**Descrição:** Só é possível concluir atendimento com status "em_andamento".
**Gatilho:** Clique em "Concluir Atendimento".
**Ação:** Sistema altera status para "concluído", registra horário de fim, e registra o pagamento.
**Exceção:** Nenhuma.

### RG-AT-04: Registro de Pagamento
**Descrição:** Todo atendimento concluído deve ter uma forma de pagamento registrada.
**Gatilho:** Conclusão de atendimento.
**Ação:** Sistema exige seleção de forma de pagamento (dinheiro, cartão, PIX, voucher) antes de permitir a conclusão.
**Exceção:** Nenhuma.

### RG-AT-05: Registro de No-show
**Descrição:** Cliente que não comparece ao horário agendado tem o agendamento marcado como "ausente".
**Gatilho:** Barbeiro marca como ausente ou sistema marca automaticamente após X minutos de atraso (configurável).
**Ação:** Sistema altera status para "ausente", libera o horário e incrementa o contador de no-shows do cliente.
**Exceção:** Nenhuma.

### RG-AT-06: Observações do Atendimento
**Descrição:** O barbeiro pode adicionar observações livres a cada atendimento.
**Gatilho:** Início ou conclusão de atendimento.
**Ação:** Sistema permite campo de texto livre para observações.
**Exceção:** Nenhuma.

---

## 7. Regras de Cancelamento e Remarcação

### RG-CX-01: Cancelamento de Agendamento
**Descrição:** Só é possível cancelar agendamentos com status "agendado" ou "confirmado".
**Gatilho:** Solicitação de cancelamento.
**Ação:** Sistema altera status para "cancelado", libera o horário e (opcionalmente) notifica o cliente.
**Exceção:** Agendamentos já concluídos ou ausentes não podem ser cancelados.

### RG-CX-02: Remarcação de Agendamento
**Descrição:** A remarcação altera data e/ou horário mantendo cliente, serviço e profissional originais.
**Gatilho:** Solicitação de remarcação.
**Ação:** Sistema valida disponibilidade do novo horário e atualiza o agendamento.
**Exceção:** Novo horário deve respeitar RG-AG-01 a RG-AG-07.

### RG-CX-03: Limite de Cancelamentos do Cliente
**Descrição:** Cliente com N ou mais cancelamentos em um período M pode ter restrições para novos agendamentos (valor configurável).
**Gatilho:** Novo cancelamento que atinge o limite.
**Ação:** Sistema exibe aviso e pode exigir confirmação prévia para próximos agendamentos.
**Exceção:** Admin pode sobrescrever a restrição.

---

## 8. Regras de Configurações

### RG-CF-01: Horário de Funcionamento Afeta Agenda
**Descrição:** Alterações no horário de funcionamento afetam apenas novos agendamentos; agendamentos existentes mantêm seus horários.
**Gatilho:** Edição do horário de funcionamento.
**Ação:** Sistema recalcula slots disponíveis a partir da data da alteração.
**Exceção:** Nenhuma.

### RG-CF-02: Dia Fechado Bloqueia Slots
**Descrição:** Dia marcado como "fechado" não gera nenhum slot de agendamento.
**Gatilho:** Marcar dia como fechado nas configurações.
**Ação:** Sistema remove todos os slots daquele dia da agenda.
**Exceção:** Nenhuma.

### RG-CF-03: Notificações Configuráveis por Tipo
**Descrição:** Cada tipo de notificação (confirmação, lembrete, cancelamento, reagendamento, aniversário) pode ser ativado ou desativado independentemente.
**Gatilho:** Alteração nas configurações de notificação.
**Ação:** Sistema envia ou não notificações conforme as preferências salvas.
**Exceção:** Nenhuma.

---

## 9. Regras de Caixa e Financeiro (Visão do Barbeiro)

### RG-CX-01: Registro de Recebimento
**Descrição:** Todo atendimento concluído gera um registro de recebimento no caixa do barbeiro.
**Gatilho:** Conclusão de atendimento com pagamento.
**Ação:** Sistema adiciona entrada ao caixa com valor, forma de pagamento e data.
**Exceção:** Nenhuma.

### RG-CX-02: Comissão do Barbeiro
**Descrição:** O barbeiro recebe comissão sobre cada atendimento concluído, conforme valor fixo ou percentual configurado no serviço.
**Gatilho:** Conclusão de atendimento.
**Ação:** Sistema calcula e registra a comissão devida ao barbeiro.
**Exceção:** Serviços sem comissão configurada geram comissão zero.

### RG-CX-03: Formas de Pagamento
**Descrição:** Formas de pagamento aceitas: dinheiro, cartão de crédito/débito, PIX, voucher.
**Gatilho:** Registro de pagamento no atendimento.
**Ação:** Sistema exige seleção de uma das formas disponíveis.
**Exceção:** Nenhuma.

---

## 10. Exceções e Casos de Borda

| Caso | Comportamento do Sistema |
|------|-------------------------|
| Dois barbeiros tentam agendar o mesmo horário para o mesmo cliente | Primeiro a salvar vence; segundo recebe mensagem de conflito |
| Cliente sem telefone tenta agendar | Sistema bloqueia e exige telefone (campo obrigatório) |
| Agendamento em feriado ou dia fechado | Sistema não exibe o dia como disponível |
| Serviço excluído com agendamentos históricos | Serviço é inativado, não excluído; históricos mantidos |
| Profissional desligado com agendamentos futuros | Agendamentos são reagendados automaticamente ou cliente é notificado |
| Pagamento não registrado ao concluir atendimento | Sistema não permite concluir sem forma de pagamento |

---

## 11. Regras Pendentes de Confirmação

As seguintes regras estão nos requisitos do projeto mas precisam de confirmação do Comandante:

- Valor exato da antecedência mínima para agendamento (padrão sugerido: 2 horas)
- Valor exato da antecedência máxima para agendamento (padrão sugerido: 30 dias)
- Limite de no-shows para bloqueio automático de cliente (padrão sugerido: 3)
- Período de inatividade para marcar cliente como inativo (padrão sugerido: 6 meses)
- Pontos de fidelidade por real gasto (padrão sugerido: 1 ponto por R$ 1,00)
- Minutos de atraso para marcar no-show automático (padrão sugerido: 15 minutos)
- Formas de pagamento adicionais além das quatro listadas

---

*Este documento é uma especificação funcional original. Não contém cópia de código, marca ou identidade visual de nenhum sistema de terceiros.*
