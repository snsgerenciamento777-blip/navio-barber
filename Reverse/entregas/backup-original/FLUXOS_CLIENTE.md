# FLUXOS_CLIENTE.md

Fluxos de Funcionamento — Área do Cliente
Navio Barber 2.0 | Missão 03 — Engenharia Reversa Funcional
Data: 2026-11-06 | Status: Especificação funcional (não implementação)

---

## 1. Visão Geral

Este documento descreve os fluxos de funcionamento da área do cliente do Navio Barber 2.0,
detalhando cada passo do usuário, as telas envolvidas, as decisões tomadas e os resultados esperados.
Especificação funcional original, sem cópia de nenhum sistema concorrente.

---

## 2. Fluxo: Descoberta e Escolha do Profissional

**Objetivo:** O cliente encontra uma barbearia ou profissional e acessa seu perfil.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Acessa a página pública inicial | Exibe campo de busca e lista de profissionais/barbearias | CLI-PUBLIC-01 | Página inicial carregada |
| 2 | Busca por cidade, bairro ou nome | Filtra resultados conforme a busca | CLI-PUBLIC-01 | Lista filtrada exibida |
| 3 | Clica em um profissional/barbearia | Abre o perfil com serviços, preços, horários e avaliações | CLI-PERFIL-01 | Perfil exibido |
| 4 | (Opcional) Visualiza galeria e avaliações | Exibe fotos e comentários de outros clientes | CLI-PERFIL-02 / CLI-PERFIL-03 | Informações adicionais carregadas |
| 5 | Clica em "Escolher Serviço" | Inicia o fluxo de agendamento | CLI-SERVICO-01 | Fluxo de agendamento iniciado |

**Resultado esperado:** Cliente está na tela de seleção de serviço do profissional escolhido.

---

## 3. Fluxo: Seleção de Serviços

**Objetivo:** O cliente escolhe o(s) serviço(s) que deseja agendar.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Visualiza lista de serviços | Exibe nome, descrição, preço e duração de cada serviço | CLI-SERVICO-01 | Serviços listados |
| 2 | Seleciona um ou mais serviços | Marca serviços selecionados; atualiza resumo lateral | CLI-SERVICO-01 | Serviço(s) selecionado(s); duração e preço total calculados |
| 3 | Clica em "Escolher Horário" | Avança para a seleção de data e horário | CLI-HORARIO-01 | Fluxo continua |

**Regras de negócio aplicadas:**
- Cliente pode selecionar múltiplos serviços (agendamento combinado)
- Duração total é soma das durações dos serviços
- Preço total é soma dos preços dos serviços

---

## 4. Fluxo: Seleção de Data e Horário

**Objetivo:** O cliente escolhe quando deseja ser atendido.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Visualiza calendário de disponibilidade | Exibe dias com slots livres destacados | CLI-HORARIO-01 | Calendário exibido |
| 2 | Seleciona uma data | Exibe horários disponíveis para aquela data | CLI-HORARIO-01 | Lista de horários exibida |
| 3 | Seleciona um horário disponível | Marca o horário selecionado | CLI-HORARIO-01 | Horário selecionado |
| 4 | Clica em "Próximo" | Avança para identificação do cliente | CLI-IDENTIFICACAO-01 | Fluxo continua |

**Regras de negócio aplicadas:**
- Só são exibidos horários dentro do horário de funcionamento do profissional
- Horários já ocupados não estão disponíveis
- Dias fechados não aparecem no calendário

---

## 5. Fluxo: Identificação e Cadastro do Cliente

**Objetivo:** Identificar quem está fazendo o agendamento.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Informa telefone | Busca cliente existente por telefone | CLI-IDENTIFICACAO-01 | Cliente encontrado ou não encontrado |
| 2a | Cliente existente: confirma dados | Exibe dados cadastrados para confirmação | CLI-IDENTIFICACAO-01 | Dados confirmados |
| 2b | Cliente novo: preenche cadastro rápido | Exibe formulário com nome, telefone, email, data nascimento | CLI-IDENTIFICACAO-02 | Dados preenchidos |
| 3 | Salva/confirma | Avança para confirmação da reserva | CLI-CONFIRMACAO-01 | Cliente identificado/cadastrado |

**Regras de negócio aplicadas:**
- Telefone é obrigatório e único na base
- Cliente existente recupera seus dados automaticamente
- Cliente novo é cadastrado durante o fluxo

---

## 6. Fluxo: Confirmação da Reserva

**Objetivo:** O cliente revisa e confirma o agendamento.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Revisa resumo do agendamento | Exibe cliente, profissional, serviço(s), data, horário, duração, preço total | CLI-CONFIRMACAO-01 | Resumo exibido |
| 2 | Lê e concorda com termos e condições | Marca checkbox de concordância | CLI-CONFIRMACAO-01 | Termos aceitos |
| 3 | (Opcional) Configura notificações | Ativa/desativa recebimento de confirmação e lembretes | CLI-CONFIRMACAO-01 | Preferências definidas |
| 4 | Clica em "Confirmar Reserva" | Salva o agendamento e gera código de confirmação | CLI-CONFIRMACAO-01 → CLI-SUCESSO-01 | Reserva confirmada |

**Regras de negócio aplicadas:**
- Termos e condições devem ser aceitos para confirmar
- Código de confirmação é gerado automaticamente
- Notificações são enviadas conforme preferências do cliente

---

## 7. Fluxo: Reserva Confirmada (Sucesso)

**Objetivo:** Exibir confirmação final e próximos passos.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Visualiza mensagem de sucesso | Exibe número da reserva, código de confirmação, resumo completo | CLI-SUCESSO-01 | Confirmação exibida |
| 2 | (Opcional) Adiciona à agenda pessoal | Gera arquivo .ics ou link para adicionar ao calendário | CLI-SUCESSO-01 | Reserva adicionada à agenda pessoal |
| 3 | (Opcional) Ver meus agendamentos | Redireciona para lista de agendamentos | CLI-MEUS-AGENDAMENTOS-01 | Lista de agendamentos exibida |
| 4 | (Opcional) Volta à página inicial | Redireciona para a página pública | CLI-PUBLIC-01 | Página inicial exibida |

**Resultado esperado:** Reserva confirmada com código de confirmação; cliente tem opções de próximos passos.

---

## 8. Fluxo: Visualização de Meus Agendamentos

**Objetivo:** O cliente acompanha seus agendamentos futuros e passados.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Acessa "Meus Agendamentos" | Exibe lista de agendamentos futuros e passados | CLI-MEUS-AGENDAMENTOS-01 | Lista exibida |
| 2 | Filtra por status (opcional) | Filtra agendamentos conforme seleção | CLI-MEUS-AGENDAMENTOS-01 | Lista filtrada |
| 3 | Clica em um agendamento para ver detalhes | Exibe informações completas da reserva | CLI-MEUS-AGENDAMENTOS-02 | Detalhes exibidos |
| 4 | (Opcional) Cancela ou remarca | Inicia fluxo de cancelamento ou remarcação | CLI-CANCELAR-01 / CLI-REMARCAR-01 | Fluxo correspondente iniciado |

**Resultado esperado:** Cliente tem visão completa de seus agendamentos.

---

## 9. Fluxo: Cancelamento de Reserva

**Objetivo:** O cliente cancela um agendamento futuro.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Seleciona agendamento futuro e clica em "Cancelar" | Abre tela de confirmação de cancelamento | CLI-CANCELAR-01 | Tela de cancelamento exibida |
| 2 | (Opcional) Seleciona motivo | Registra motivo do cancelamento | CLI-CANCELAR-01 | Motivo registrado |
| 3 | Confirma cancelamento | Altera status para "cancelado"; libera o horário; notifica o profissional | CLI-CANCELAR-01 → CLI-MEUS-AGENDAMENTOS-01 | Reserva cancelada |

**Regras de negócio aplicadas:**
- Só é possível cancelar agendamentos com status "agendado" ou "confirmado"
- Horário é liberado imediatamente para outros clientes
- Profissional é notificado do cancelamento (se configurado)
- Cliente pode ter restrições se tiver muitos cancelamentos (configurável)

---

## 10. Fluxo: Remarcação de Reserva

**Objetivo:** O cliente altera a data e/ou horário de um agendamento futuro.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Seleciona agendamento futuro e clica em "Remarcar" | Abre tela de seleção de nova data/horário | CLI-REMARCAR-01 | Tela de remarcação exibida |
| 2 | Seleciona nova data | Exibe horários disponíveis para a data | CLI-REMARCAR-01 | Horários exibidos |
| 3 | Seleciona novo horário | Marca o novo horário | CLI-REMARCAR-01 | Novo horário selecionado |
| 4 | Confirma remarcação | Atualiza o agendamento; notifica o profissional | CLI-REMARCAR-01 → CLI-MEUS-AGENDAMENTOS-01 | Reserva remarcada |

**Regras de negócio aplicadas:**
- Novo horário deve estar disponível (não ocupado)
- Novo horário deve estar dentro do horário de funcionamento
- Profissional é notificado da alteração

---

## 11. Fluxo: Gestão do Perfil do Cliente

**Objetivo:** O cliente gerencia seus dados cadastrais e preferências.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Acessa "Meu Perfil" | Exibe dados cadastrais e preferências | CLI-PERFIL-CLIENTE-01 | Perfil exibido |
| 2 | Edita dados (nome, email, preferências) | Permite alteração dos campos | CLI-PERFIL-CLIENTE-01 | Dados editados |
| 3 | Salva alterações | Atualiza o cadastro do cliente | CLI-PERFIL-CLIENTE-01 | Perfil atualizado |

**Resultado esperado:** Dados do cliente atualizados na base.

---

## 12. Estados do Agendamento (Visão do Cliente)

| Estado | Descrição | O Cliente Pode |
|--------|-----------|----------------|
| agendado | Criado, aguardando confirmação | Cancelar, remarcar |
| confirmado | Confirmado pelo sistema ou profissional | Cancelar, remarcar |
| em_andamento | Atendimento em progresso | Visualizar apenas |
| concluído | Atendimento finalizado | Visualizar histórico, avaliar (pendente) |
| cancelado | Cancelado pelo cliente ou profissional | Visualizar (histórico) |
| ausente | Cliente não compareceu | Visualizar (histórico) |

---

## 13. Fluxos Não Observados / Pendentes de Confirmação

Os seguintes fluxos são mencionados nos requisitos do projeto mas precisam de confirmação do Comandante:

- Fluxo de login/cadastro de cliente (agendamento pode ser feito sem login?)
- Fluxo de avaliação pós-atendimento (cliente avalia o serviço após o atendimento)
- Fluxo de pagamento online (integração com gateway de pagamento)
- Fluxo de indicação de amigos (programa de indicação premiada)
- Fluxo de pacotes e assinaturas (compra de pacotes de serviços)
- Fluxo de lembrança de aniversário (oferta personalizada)

---

*Este documento é uma especificação funcional original. Não contém cópia de código, marca ou identidade visual de nenhum sistema de terceiros.*
