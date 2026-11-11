# FLUXOS_BARBEIRO.md

Fluxos de Funcionamento — Área do Barbeiro
Navio Barber 2.0 | Missão 03 — Engenharia Reversa Funcional
Data: 2026-11-06 | Status: Especificação funcional (não implementação)

---

## 1. Visão Geral

Este documento descreve os fluxos de funcionamento da área do barbeiro, detalhando
cada passo do usuário, as telas envolvidas, as decisões tomadas e os resultados esperados.
Especificação funcional original, sem cópia de nenhum sistema concorrente.

---

## 2. Fluxo: Início do Expediente

**Objetivo:** O barbeiro inicia seu dia de trabalho e confere a agenda.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Faz login na plataforma | Valida credenciais e abre o dashboard | BBR-DASH-01 | Dashboard carregado com resumo do dia |
| 2 | Visualiza cards de resumo | Exibe agendamentos de hoje, receita prevista, clientes aguardando | BBR-DASH-01 | Barbeiro tem visão do dia |
| 3 | Abre a agenda | Carrega visão da agenda do dia/semana | BBR-AGENDA-01 | Grade de horários exibida |
| 4 | Confere horários ocupados e livres | Destaca slots ocupados e disponíveis | BBR-AGENDA-01 | Barbeiro sabe sua disponibilidade |
| 5 | (Opcional) Ajusta configurações | Abre tela de configurações | BBR-CONFIG-01 | Preferências verificadas |

**Resultado esperado:** Barbeiro está ciente de sua agenda do dia e pronto para atender.

---

## 3. Fluxo: Novo Agendamento (Criar do Zero)

**Objetivo:** Agendar um novo atendimento para um cliente.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Clica em "Novo Agendamento" | Abre o formulário de agendamento | BBR-AGENDAMENTO-01 | Fluxo iniciado, etapa 1 |
| 2 | Seleciona cliente existente ou cadastra novo | Busca cliente por nome/telefone; se novo, redireciona para cadastro | BBR-AGENDAMENTO-02 / BBR-CLIENTE-02 | Cliente selecionado ou cadastrado |
| 3 | Seleciona serviço(s) | Exibe catálogo de serviços ativos com preço e duração | BBR-AGENDAMENTO-03 | Serviço(s) selecionado(s) |
| 4 | Escolhe data e horário | Exibe calendário e slots disponíveis | BBR-AGENDAMENTO-04 | Horário selecionado |
| 5 | Revisa resumo do agendamento | Exibe cliente, serviço, profissional, data, horário, preço total | BBR-AGENDAMENTO-05 | Resumo pronto para confirmação |
| 6 | Confirma agendamento | Salva o agendamento; opcionalmente envia confirmação automática | BBR-AGENDAMENTO-05 → BBR-DASH-01 | Agendamento criado na agenda |

**Regras de negócio aplicadas:**
- Não permite agendar em horário já ocupado
- Não permite agendar fora do horário de funcionamento
- Duração total é soma dos serviços selecionados
- Preço total é soma dos preços dos serviços

---

## 4. Fluxo: Check-in do Cliente e Início do Atendimento

**Objetivo:** O cliente chega e o barbeiro inicia o atendimento.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Cliente chega ao estabelecimento | — | — | — |
| 2 | Barbeiro acessa "Minha Agenda" | Exibe atendimentos de hoje do barbeiro logado | BBR-MINHA-AGENDA-01 | Lista de clientes do dia |
| 3 | Localiza o cliente na agenda | Destaca o agendamento do horário atual | BBR-MINHA-AGENDA-01 | Cliente identificado |
| 4 | Clica em "Iniciar Atendimento" | Altera status do agendamento para "em andamento" | BBR-ATENDIMENTO-01 | Atendimento iniciado |
| 5 | (Opcional) Adiciona observações | Registra notas sobre o atendimento | BBR-ATENDIMENTO-01 | Observações salvas |

**Resultado esperado:** Status do agendamento alterado para "em andamento"; cliente na cadeira.

---

## 5. Fluxo: Finalização do Atendimento

**Objetivo:** Concluir o atendimento e registrar o pagamento.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Barbeiro termina o corte/serviço | — | — | — |
| 2 | Clica em "Concluir Atendimento" | Abre tela de finalização com valor a receber | BBR-ATENDIMENTO-01 | Tela de conclusão exibida |
| 3 | Confirma forma de pagamento | Registra pagamento (dinheiro, cartão, PIX, voucher) | BBR-ATENDIMENTO-01 | Pagamento registrado |
| 4 | (Opcional) Adiciona observações finais | Salva notas sobre o serviço executado | BBR-ATENDIMENTO-01 | Observações salvas |
| 5 | Confirma conclusão | Altera status para "concluído"; libera o horário na agenda | BBR-ATENDIMENTO-01 → BBR-MINHA-AGENDA-01 | Atendimento concluído; horário liberado |

**Resultado esperado:** Agendamento marcado como concluído; pagamento registrado no caixa; horário liberado para novo agendamento.

---

## 6. Fluxo: Cliente Não Compareceu (No-show)

**Objetivo:** Registrar que o cliente não compareceu ao agendamento.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Horário do agendamento passou e cliente não chegou | — | — | — |
| 2 | Barbeiro marca o agendamento como "ausente" | Altera status para "ausente"; libera o horário | BBR-ATENDIMENTO-01 | Agendamento marcado como no-show |
| 3 | Sistema registra no histórico do cliente | Incrementa contador de no-shows do cliente | BBR-CLIENTE-05 | Histórico atualizado |

**Regras de negócio aplicadas:**
- Horário é liberado imediatamente para novo agendamento
- Contador de no-shows do cliente é incrementado
- Após N no-shows, sistema pode exigir confirmação prévia para novos agendamentos (configurável)

---

## 7. Fluxo: Cancelamento de Agendamento

**Objetivo:** Cancelar um agendamento existente.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Abre agenda ou lista de agendamentos | Exibe agendamentos futuros | BBR-AGENDA-01 / BBR-DASH-01 | Agendamentos listados |
| 2 | Seleciona agendamento e clica em "Cancelar" | Abre tela de motivo do cancelamento | BBR-CANCELAMENTO-01 → BBR-CANCELAMENTO-02 | Tela de motivo exibida |
| 3 | Seleciona motivo e opcional observação | Registra motivo do cancelamento | BBR-CANCELAMENTO-02 | Motivo registrado |
| 4 | Confirma cancelamento | Altera status para "cancelado"; libera o horário; notifica cliente (se configurado) | BBR-CANCELAMENTO-02 → BBR-AGENDA-01 | Agendamento cancelado; horário liberado |

**Regras de negócio aplicadas:**
- Só pode cancelar agendamentos com status "agendado" ou "confirmado"
- Horário é liberado imediatamente
- Notificação automática ao cliente pode ser enviada (conforme configuração)
- Cliente pode ter restrição se tiver muitos cancelamentos (configurável)

---

## 8. Fluxo: Remarcar Agendamento

**Objetivo:** Alterar data e/ou horário de um agendamento existente.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Seleciona agendamento e clica em "Remarcar" | Abre tela de nova data/horário | BBR-CANCELAMENTO-01 → BBR-CANCELAMENTO-03 | Tela de reagendamento exibida |
| 2 | Escolhe nova data | Exibe calendário com disponibilidade | BBR-CANCELAMENTO-03 | Data selecionada |
| 3 | Escolhe novo horário | Exibe slots disponíveis para a data | BBR-CANCELAMENTO-03 | Horário selecionado |
| 4 | Confirma reagendamento | Altera data/horário do agendamento; notifica cliente | BBR-CANCELAMENTO-03 → BBR-AGENDA-01 | Agendamento remarcado |

**Regras de negócio aplicadas:**
- Novo horário deve estar disponível (não ocupado)
- Novo horário deve estar dentro do horário de funcionamento
- Cliente é notificado da alteração (se configurado)

---

## 9. Fluxo: Cadastro de Novo Serviço

**Objetivo:** Adicionar um novo serviço ao catálogo.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Acessa "Catálogo de Serviços" | Exibe lista de serviços atuais | BBR-SERVICO-01 | Lista exibida |
| 2 | Clica em "Novo Serviço" | Abre formulário de cadastro | BBR-SERVICO-02 | Formulário exibido |
| 3 | Preenche nome, categoria, preço, duração, comissão | Valida campos obrigatórios | BBR-SERVICO-02 | Dados preenchidos |
| 4 | Salva serviço | Cadastra o serviço e adiciona à lista | BBR-SERVICO-02 → BBR-SERVICO-01 | Serviço cadastrado e disponível para agendamento |

**Regras de negócio aplicadas:**
- Nome do serviço é obrigatório
- Preço e duração são obrigatórios
- Duração mínima: 15 minutos
- Serviço fica ativo por padrão após cadastro

---

## 10. Fluxo: Cadastro de Novo Cliente

**Objetivo:** Cadastrar um novo cliente na base de dados.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Acessa "Cadastro de Clientes" ou inicia agendamento | Exibe lista de clientes ou fluxo de agendamento | BBR-CLIENTE-01 / BBR-AGENDAMENTO-02 | Tela de clientes |
| 2 | Clica em "Novo Cliente" | Abre formulário de cadastro | BBR-CLIENTE-02 | Formulário exibido |
| 3 | Preenche nome, telefone, email, data de nascimento, preferências | Valida telefone (obrigatório e único) | BBR-CLIENTE-02 | Dados preenchidos |
| 4 | Salva cliente | Cadastra o cliente na base | BBR-CLIENTE-02 → BBR-CLIENTE-01 | Cliente cadastrado |

**Regras de negócio aplicadas:**
- Nome e telefone são obrigatórios
- Telefone deve ser único na base
- Cliente é cadastrado como "novo" (primeira visita)

---

## 11. Fluxo: Gestão de Configurações da Barbearia

**Objetivo:** Configurar dados do estabelecimento e horário de funcionamento.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Acessa "Configurações" | Exibe categorias de configuração | BBR-CONFIG-01 | Menu de configurações |
| 2 | Edita dados do estabelecimento | Preenche nome, endereço, telefone, logo | BBR-CONFIG-02 | Dados salvos |
| 3 | Configura horário de funcionamento | Define abertura/fechamento por dia da semana | BBR-CONFIG-03 | Horários definidos |
| 4 | Configura notificações | Ativa/desativa tipos de notificação automática | BBR-CONFIG-04 | Preferências salvas |
| 5 | Edita perfil pessoal do barbeiro | Preenche dados pessoais, especialidades, foto | BBR-CONFIG-05 | Perfil atualizado |

**Regras de negócio aplicadas:**
- Horário de funcionamento afeta a disponibilidade de slots na agenda
- Dias marcados como "fechado" não geram slots disponíveis
- Notificações são enviadas apenas para tipos ativados

---

## 12. Fluxo: Visualização de Relatórios Simples

**Objetivo:** Acompanhar indicadores de desempenho pessoal.

| Passo | Ação do Usuário | Sistema Responde | Tela | Resultado |
|-------|----------------|------------------|------|-----------|
| 1 | Acessa "Relatórios Básicos" | Exibe indicadores do período selecionado | BBR-RELATORIO-01 | Relatório exibido |
| 2 | Seleciona período (dia, semana, mês) | Recalcula indicadores para o período | BBR-RELATORIO-01 | Dados atualizados |
| 3 | (Opcional) Exporta CSV | Gera arquivo para download | BBR-RELATORIO-01 | Arquivo exportado |

**Indicadores disponíveis:**
- Total de atendimentos
- Receita bruta
- Comissões acumuladas
- Taxa de comparecimento
- Clientes únicos atendidos

---

## 13. Estados de Cada Funcionalidade

### 13.1 Estados do Agendamento

| Estado | Descrição | Transições Permitidas |
|--------|-----------|----------------------|
| agendado | Criado, aguardando confirmação | confirmado, cancelado |
| confirmado | Confirmado pelo barbeiro ou sistema | em_andamento, cancelado, ausente |
| em_andamento | Atendimento em progresso | concluído, cancelado |
| concluído | Atendimento finalizado e pago | (final) |
| cancelado | Cancelado por barbeiro ou cliente | (final) |
| ausente | Cliente não compareceu (no-show) | (final) |

### 13.2 Estados do Cliente

| Estado | Descrição |
|--------|-----------|
| novo | Primeira visita, sem histórico |
| ativo | Tem atendimentos concluídos |
| inativo | Sem atendimentos há período configurado |
| bloqueado | Muitos no-shows ou cancelamentos (configurável) |

### 13.3 Estados do Serviço

| Estado | Descrição |
|--------|-----------|
| ativo | Disponível para agendamento |
| inativo | Não disponível para novos agendamentos (mantém históricos) |

### 13.4 Estados do Profissional

| Estado | Descrição |
|--------|-----------|
| ativo | Disponível para agendamentos |
| inativo | Não disponível (férias, desligamento, etc.) |
| folga | Temporariamente indisponível (bloqueio de agenda) |

---

## 14. Relacionamentos entre Telas, Ações, Dados e Permissões

| Tela | Dados Principais | Ações | Permissão Necessária |
|------|-----------------|-------|---------------------|
| BBR-DASH-01 | Resumo do dia | Visualizar | Barbeiro logado |
| BBR-AGENDA-01 | Agendamentos, horários | Visualizar, criar, editar | Barbeiro logado |
| BBR-SERVICO-01 | Serviços, preços, duração | Criar, editar, inativar | Barbeiro/Admin |
| BBR-CLIENTE-01 | Dados cadastrais, histórico | Criar, editar, visualizar | Barbeiro logado |
| BBR-AGENDAMENTO-01 | Cliente, serviço, data, horário, preço | Criar, confirmar | Barbeiro logado |
| BBR-ATENDIMENTO-01 | Status, pagamento, observações | Iniciar, concluir, marcar ausente | Barbeiro logado |
| BBR-CANCELAMENTO-01 | Motivo, nova data | Cancelar, remarcar | Barbeiro logado |
| BBR-CONFIG-01 | Dados estab., horários, notificações | Editar | Barbeiro/Admin |
| BBR-CAIXA-01 | Recebimentos, comissões | Visualizar, marcar pago | Barbeiro logado |
| BBR-RELATORIO-01 | Indicadores de desempenho | Visualizar, exportar | Barbeiro logado |

---

## 15. Fluxos Não Observados / Pendentes de Confirmação

Os seguintes fluxos são mencionados nos requisitos do projeto mas precisam de confirmação do Comandante:

- Fluxo de autenticação/login do barbeiro
- Fluxo de recuperação de senha
- Fluxo de onboarding (primeiro acesso)
- Fluxo de integração com WhatsApp Business (envio automático de confirmações)
- Fluxo de emissão de notas fiscais
- Fluxo de comissão automática por serviço

---

*Este documento é uma especificação funcional original. Não contém cópia de código, marca ou identidade visual de nenhum sistema de terceiros.*
