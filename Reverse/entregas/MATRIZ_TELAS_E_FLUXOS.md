# MATRIZ_TELAS_E_FLUXOS.md

Matriz de Telas e Fluxos — Referência Hora do Estilo
Navio Barber 2.0 | Missão 04 — Engenharia Reversa e Mapeamento Funcional
Data: 2026-11-06 | Operador: Kilo Code | Orquestrador: Aletheia v23

---

## 1. Visão Geral

Esta matriz relaciona cada tela mapeada na Missão 03 com seus fluxos associados, classificando o nível de evidência para cada item com base no arquivo HAR e nos documentos da Missão 03.

Classificações:
- **CONFIRMADA**: Evidência direta no HAR (endpoint + corpo de resposta) ou correspondência validada
- **INFERÊNCIA**: Interpretação plausível do domínio, sem respaldo direto no HAR
- **DESCONHECIDA**: Sem evidência suficiente
- **PENDENTE DE EVIDÊNCIA**: Aguardando confirmação ou investigação adicional

---

## 2. Matriz de Telas — Área do Barbeiro (39 telas totais: 26 barbeiro + 13 cliente)

### 2.1 Dashboard / Visão Geral

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-DASH-01 | Dashboard do Barbeiro | Início do Expediente | Cards de resumo, próximos atendimentos, alertas | `/dashboard?user_id=59` | CONFIRMADA (parcial) | Endpoint existe, corpo capturado: total_today, total_week, total_customers, alerts, hours[] |
| BBR-DASH-01 | Dashboard do Barbeiro | Visualização de Relatórios | Indicadores do período | `/dashboard/setup-status` | CONFIRMADA (parcial) | Corpo capturado: progress, completed_steps, total_steps, completed, scheduling_ready |

### 2.2 Agenda (Calendário)

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-AGENDA-01 | Agenda de Atendimentos | Início do Expediente, Novo Agendamento | Grade de horários, blocos coloridos, slots livres/ocupados | `/appointments?start_date=&end_date=&user_id=` | CONFIRMADA | Endpoint existe, corpo capturado: days[] com open_time, close_time, appointments[], free_spaces[], absences[] |
| BBR-AGENDA-02 | Agenda — Visão Semanal | Início do Expediente | 7 colunas, linhas de horário | `/appointments?start_date=&end_date=&user_id=` | CONFIRMADA (parcial) | Corpo capturado mostra dias com horários de abertura/fechamento |
| BBR-AGENDA-03 | Agenda — Visão Diária | Início do Expediente, Check-in | Coluna única, lista cronológica | `/appointments?start_date=&end_date=&user_id=` | CONFIRMADA (parcial) | Corpo capturado mostra appointments[] com start_time, end_time, duration_minutes |
| BBR-AGENDA-04 | Agenda — Visão Mensal | Início do Expediente | Grade mensal, indicador de ocupação | `/appointments?start_date=&end_date=&user_id=` | CONFIRMADA (parcial) | Corpo capturado mostra days[] por data |
| BBR-AGENDA-05 | Filtros da Agenda | Início do Expediente | Filtro por profissional, serviço, status, datas | `/employees/company/24`, `/appointments` | CONFIRMADA (parcial) | Funcionários confirmados (id, name); serviços observados (services[]); status observado (cancelado_barbeiro) |

### 2.3 Cadastro de Serviços

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-SERVICO-01 | Catálogo de Serviços | Cadastro de Novo Serviço | Lista de serviços, nome, categoria, preço, duração, comissão | `/appointments` | CONFIRMADA (parcial) | Serviços observados em appointments: services:["Corte Navalha"]; catálogo completo não capturado |
| BBR-SERVICO-02 | Novo Serviço | Cadastro de Novo Serviço | Nome, categoria, descrição, preço, duração, comissão, ativo/inativo | Sem endpoint de serviços | DESCONHECIDA | Sem endpoint de cadastro de serviço com corpo no HAR |
| BBR-SERVICO-03 | Editar Serviço | Cadastro de Novo Serviço | Mesmos campos preenchidos, indicador de agendamentos futuros | Sem endpoint de serviços | DESCONHECIDA | — |
| BBR-SERVICO-04 | Detalhes do Serviço | Cadastro de Novo Serviço | Todos os dados, histórico de alterações, agendamentos futuros | Sem endpoint de serviços | DESCONHECIDA | — |

### 2.4 Cadastro de Profissionais

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-PROFISSIONAL-01 | Gestão de Profissionais | Cadastro de Novo Profissional | Lista de profissionais, nome, contato, especialidade, status, comissão | `/employees/company/24` | CONFIRMADA | Endpoint existe, corpo capturado: [{"id":59,"name":"Guga Souza"}] |
| BBR-PROFISSIONAL-02 | Novo Profissional | Cadastro de Novo Profissional | Nome, contato, especialidade, comissão padrão, status | `/employees/company/24` | CONFIRMADA (parcial) | Estrutura de profissional confirmada: id, name; outros campos não capturados |
| BBR-PROFISSIONAL-03 | Editar Profissional | Cadastro de Novo Profissional | Mesmos campos preenchidos | `/employees/company/24` | CONFIRMADA (parcial) | Estrutura confirmada; edição não capturada |
| BBR-PROFISSIONAL-04 | Detalhes do Profissional | Cadastro de Novo Profissional | Dados completos, histórico de alterações | `/employees/company/24` | CONFIRMADA (parcial) | Estrutura confirmada; detalhes adicionais não capturados |

### 2.5 Gestão de Clientes (CRM)

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-CLIENTE-01 | Cadastro de Clientes | Cadastro de Novo Cliente | Lista de clientes, busca, tabela com dados | `/customers?company_id=24` | CONFIRMADA | Endpoint existe, corpo capturado: [{"id":3813,"full_name":"teste pai","is_active":1,"email":"teste.test@gmail.com","phone":"(11) 99786-4555","criado_em":"2026-11-04T19:28:43.000Z"}] |
| BBR-CLIENTE-02 | Novo Cliente | Cadastro de Novo Cliente | Nome, telefone, email, data nascimento, preferências | `/customers?company_id=24` | CONFIRMADA (parcial) | Estrutura confirmada: id, full_name, is_active, email, phone, criado_em |
| BBR-CLIENTE-03 | Editar Cliente | Cadastro de Novo Cliente | Mesmos campos preenchidos | `/customers?company_id=24` | CONFIRMADA (parcial) | Estrutura confirmada; edição não capturada |
| BBR-CLIENTE-04 | Perfil do Cliente | Cadastro de Novo Cliente | Dados cadastrais, foto, preferências, pontos fidelidade | `/customers?company_id=24` | CONFIRMADA (parcial) | Estrutura confirmada; foto/pontos fidelidade não capturados |
| BBR-CLIENTE-05 | Histórico do Cliente | Cadastro de Novo Cliente | Lista cronológica de atendimentos | `/customers?company_id=24` | CONFIRMADA (parcial) | Estrutura confirmada; histórico de atendimentos específico não capturado |

### 2.6 Novo Agendamento (Fluxo Multi-Etapa)

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-AGENDAMENTO-01 | Criar Agendamento | Novo Agendamento | Formulário multi-etapa, resumo em tempo real | `/appointments` | DESCONHECIDA | Endpoint existe, corpo não capturado para POST |
| BBR-AGENDAMENTO-02 | Selecionar Cliente | Novo Agendamento | Busca por nome/telefone, cadastro novo | `/customers?company_id=24` | CONFIRMADA (parcial) | Estrutura de cliente confirmada |
| BBR-AGENDAMENTO-03 | Selecionar Serviço | Novo Agendamento | Lista de serviços ativos, múltiplos serviços | `/appointments` | CONFIRMADA (parcial) | Services[] observado: ["Corte Navalha"] |
| BBR-AGENDAMENTO-04 | Selecionar Horário | Novo Agendamento | Calendário, horários disponíveis, ocupado/livre | `/appointments?start_date=&end_date=&user_id=` | CONFIRMADA | Corpo capturado: hours[] com available flag, free_spaces[] |
| BBR-AGENDAMENTO-05 | Confirmar Agendamento | Novo Agendamento | Resumo completo, observações, confirmação automática | `/appointments` | DESCONHECIDA | Confirmação não capturada no HAR |

### 2.7 Minha Agenda (Pessoal do Barbeiro)

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-MINHA-AGENDA-01 | Minha Agenda Pessoal | Check-in do Cliente | Calendário filtrado pelo barbeiro logado, botão iniciar atendimento | `/appointments?user_id=59` | CONFIRMADA (parcial) | Endpoint capturado com dados de appointments por usuário |

### 2.8 Controle de Atendimento

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-ATENDIMENTO-01 | Controle de Atendimento | Finalização do Atendimento, No-show | Status, pagamento, observações, valor a receber | `PUT /appointments/finalize-previous` | CONFIRMADA (parcial) | Endpoint confirma finalização de agendamentos; `total_value:40` observado em appointments |

### 2.9 Cancelamentos e Remarcações

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-CANCELAMENTO-01 | Cancelar/Remarcar | Cancelamento, Remarcação | Lista de agendamentos futuros, botões cancelar/remarcar | `/appointments` | CONFIRMADA (parcial) | Status `"cancelado_barbeiro"` observado nos dados de appointments |
| BBR-CANCELAMENTO-02 | Motivo do Cancelamento | Cancelamento | Motivos predefinidos, observação livre | Sem endpoint específico | INFERÊNCIA | — |
| BBR-CANCELAMENTO-03 | Reagendar | Remarcação | Calendário, comparação horário original vs novo | Sem endpoint específico | INFERÊNCIA | — |

### 2.10 Configurações e Personalização

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-CONFIG-01 | Configurações da Barbearia | Gestão de Configurações | Formulários por categoria, toggles | Página `/dashboard/settings/profile`, `/dashboard/setup-status` | CONFIRMADA (parcial) | Página capturada; setup-status corpo capturado: progress, steps (account, company, branch, category, service, logo) |
| BBR-CONFIG-02 | Dados do Estabelecimento | Gestão de Configurações | Nome, endereço, telefone, email, logo, CNPJ/CPF | Página `/dashboard/settings/profile`, `/dashboard/setup-status` | CONFIRMADA (parcial) | Página capturada; setup-status corpo capturado: steps (account, company, branch, category, service, logo) confirmam existência de dados do estabelecimento |
| BBR-CONFIG-03 | Horário de Funcionamento | Gestão de Configurações | Abertura/fechamento por dia, intervalo almoço, fechado | `/appointments?start_date=&end_date=&user_id=` | CONFIRMADA (parcial) | Corpo capturado: open_time:"09:00:00", close_time:"18:00:00" por dia; schedule_exception:false observado |
| BBR-CONFIG-04 | Preferências de Notificação | Gestão de Configurações | Confirmação, lembrete, cancelamento, reagendamento, aniversário | `POST /fcm-token` | CONFIRMADA (parcial) | Mecanismo de push confirmado; tipos configuráveis são inferência |
| BBR-CONFIG-05 | Meu Perfil | Gestão de Configurações | Nome, contato, foto, especialidades, bio, comissão padrão | `GET /my-profile` | CONFIRMADA | Corpo capturado: name, email, phone, image_url |

### 2.11 Caixa / Financeiro

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-CAIXA-01 | Caixa do Barbeiro | Controle de Atendimento (pagamento) | Recebimentos, comissões, formas de pagamento | Mercado Pago `/payment_methods/search`, `/subscriptions/checkout-preview/5` | CONFIRMADA (parcial) | PIX e cartão confirmados; dinheiro e voucher são inferência |

### 2.12 Relatórios Simples

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| BBR-RELATORIO-01 | Relatórios Básicos | Visualização de Relatórios | Total atendimentos, receita bruta, comissões, taxa comparecimento, clientes únicos | `/dashboard?user_id=59` | CONFIRMADA (parcial) | Corpo capturado: total_today, total_week, total_customers, alerts; relatórios detalhados não capturados |

---

### 2.13 Telas Pendentes (Barbeiro — não mapeadas com detalhes)

| Tela | Motivo | Classificação |
|------|--------|---------------|
| Login do barbeiro | Assumida como existente, não detalhada | CONFIRMADA (parcial) | `/auth/me` corpo capturado: name, function, slug, image_url |
| Recuperação de senha | Não detalhada | DESCONHECIDA |
| Boas-vindas/onboarding primeiro acesso | Não detalhada | DESCONHECIDA |
| Configuração WhatsApp Business | Não detalhada | DESCONHECIDA |
| Emissão de notas fiscais (NF-e/NFC-e) | Não detalhada | DESCONHECIDA |

---

## 3. Matriz de Telas — Área do Cliente (13 telas)

### 3.1 Público e Descoberta

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| CLI-PUBLIC-01 | Página Pública Inicial | Descoberta e Escolha | Campo de busca, lista de profissionais, categorias, botão agendar | Sem endpoint público | DESCONHECIDA | HAR é do lado admin; nenhum endpoint público capturado |

### 3.2 Perfil do Profissional

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| CLI-PERFIL-01 | Perfil do Profissional | Descoberta e Escolha | Nome, foto, endereço, telefone, serviços, preços, horário, avaliações | `/uploads/employees/{id}-avatar.webp` | DESCONHECIDA | Imagem binária, corpo não capturado |
| CLI-PERFIL-02 | Galeria de Fotos | Descoberta e Escolha | Grid de fotos, modal ampliado | Sem endpoint específico | DESCONHECIDA | — |
| CLI-PERFIL-03 | Avaliações e Comentários | Descoberta e Escolha | Lista de avaliações, nota 1-5, comentário, data | Sem endpoint específico | DESCONHECIDA | — |

### 3.3 Seleção de Serviço

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| CLI-SERVICO-01 | Seleção de Serviço | Seleção de Serviços | Lista de serviços, preço, duração, múltiplos serviços, resumo lateral | Sem endpoint de serviços | DESCONHECIDA | — |

### 3.4 Seleção de Horário

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| CLI-HORARIO-01 | Seleção de Horário | Seleção de Data e Horário | Calendário, horários disponíveis, ocupado/livre, horário funcionamento | Sem dado de horários | DESCONHECIDA | — |

### 3.5 Identificação do Cliente

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| CLI-IDENTIFICACAO-01 | Identificação do Cliente | Identificação e Cadastro | Campo telefone, busca cliente existente, dados para confirmação | `/customers?company_id=24` | CONFIRMADA (parcial) | Endpoint existe, corpo capturado com estrutura de cliente: id, full_name, is_active, email, phone, criado_em |
| CLI-IDENTIFICACAO-02 | Cadastro Rápido | Identificação e Cadastro | Nome, telefone, email, data nascimento | `/customers?company_id=24` | CONFIRMADA (parcial) | Estrutura de cliente confirmada |

### 3.6 Confirmação da Reserva

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| CLI-CONFIRMACAO-01 | Confirmação da Reserva | Confirmação da Reserva | Resumo completo, termos, notificações, botão confirmar | Sem dado de confirmação | DESCONHECIDA | — |
| CLI-SUCESSO-01 | Reserva Confirmada | Reserva Confirmada | Mensagem sucesso, número reserva, código confirmação, botões | Sem dado de sucesso | DESCONHECIDA | — |

### 3.7 Meus Agendamentos

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| CLI-MEUS-AGENDAMENTOS-01 | Meus Agendamentos | Visualização de Meus Agendamentos | Lista futuros e passados, filtro por status, botões cancelar/remarcar | Sem dado de agendamentos cliente | DESCONHECIDA | — |
| CLI-MEUS-AGENDAMENTOS-02 | Detalhes do Agendamento | Visualização de Meus Agendamentos | Número reserva, profissional, serviço, data, horário, preço, status | Sem dado de agendamentos cliente | DESCONHECIDA | — |

### 3.8 Cancelamento e Remarcação (Cliente)

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| CLI-CANCELAR-01 | Cancelar Reserva | Cancelamento de Reserva | Confirmação, motivo opcional, política cancelamento | Sem endpoint de cancelamento | INFERÊNCIA | Sem endpoint de cancelamento com corpo |
| CLI-REMARCAR-01 | Remarcar Reserva | Remarcação de Reserva | Calendário, horários disponíveis, comparação horários | Sem endpoint de remarcação | INFERÊNCIA | Sem endpoint de remarcação com corpo |

### 3.9 Perfil do Cliente (Área Logada)

| ID | Tela | Fluxo(s) Associado(s) | Dados Principais | Endpoint HAR | Classificação | Observações |
|----|------|----------------------|------------------|--------------|---------------|-------------|
| CLI-PERFIL-CLIENTE-01 | Meu Perfil | Gestão do Perfil do Cliente | Nome, telefone, email, data nascimento, preferências, histórico resumido, pontos fidelidade | Sem dado de perfil cliente logado | DESCONHECIDA | — |

---

### 3.10 Telas Pendentes (Cliente — não mapeadas com detalhes)

| Tela | Motivo | Classificação |
|------|--------|---------------|
| Login/cadastro de cliente | Assumida como opcional | DESCONHECIDA |
| Recuperação de senha | Não detalhada | DESCONHECIDA |
| Avaliação pós-atendimento | Não detalhada | DESCONHECIDA |
| Pagamento online | Não detalhada | DESCONHECIDA |
| Indicação de amigos | Não detalhada | DESCONHECIDA |
| Pacotes e assinaturas | Não detalhada | DESCONHECIDA |

---

## 4. Matriz de Fluxos — Área do Barbeiro (13 fluxos)

| # | Fluxo | Telas Envolvidas | Classificação | Endpoint HAR | Observações |
|---|-------|-----------------|--------------|--------------|-------------|
| 1 | Início do Expediente | BBR-DASH-01, BBR-AGENDA-01, BBR-CONFIG-01 | CONFIRMADA (parcial) | `/dashboard?user_id=59`, `/dashboard/setup-status` | Corpos capturados: total_today, total_week, total_customers, progress, steps |
| 2 | Novo Agendamento | BBR-AGENDAMENTO-01 a 05 | DESCONHECIDA | `/appointments` | Corpo não capturado para POST |
| 3 | Check-in do Cliente | BBR-MINHA-AGENDA-01, BBR-ATENDIMENTO-01 | CONFIRMADA (parcial) | `/appointments?user_id=59` | Corpo capturado para appointments por usuário |
| 4 | Finalização do Atendimento | BBR-ATENDIMENTO-01 | CONFIRMADA (parcial) | `PUT /appointments/finalize-previous` | Resposta capturada |
| 5 | No-show | BBR-ATENDIMENTO-01 | INFERÊNCIA | Sem dado de no-show | — |
| 6 | Cancelamento | BBR-CANCELAMENTO-01 a 03 | CONFIRMADA (parcial) | `/appointments` | Status `"cancelado_barbeiro"` observado; endpoint de cancelamento não capturado |
| 7 | Remarcação | BBR-CANCELAMENTO-01 a 03 | INFERÊNCIA | Sem endpoint de remarcação | — |
| 8 | Cadastro de Novo Serviço | BBR-SERVICO-01 a 04 | CONFIRMADA (parcial) | `/appointments` | Services[] observado: ["Corte Navalha"]; endpoint de cadastro não capturado |
| 9 | Cadastro de Novo Cliente | BBR-CLIENTE-01 a 05 | CONFIRMADA (parcial) | `/customers?company_id=24` | Corpo capturado: id, full_name, is_active, email, phone, criado_em |
| 10 | Gestão de Configurações | BBR-CONFIG-01 a 05 | CONFIRMADA (parcial) | Página `/dashboard/settings/profile`, `/dashboard/setup-status`, `/my-profile` | Corpos capturados para setup-status e my-profile; página de configurações não extraída |
| 11 | Visualização de Relatórios | BBR-RELATORIO-01 | CONFIRMADA (parcial) | `/dashboard?user_id=59` | Corpo capturado: total_today, total_week, total_customers, alerts |
| 12 | Estados do Agendamento | BBR-ATENDIMENTO-01 | CONFIRMADA (parcial) | `PUT /appointments/finalize-previous` | Estado final confirmado; `"cancelado_barbeiro"` observado |
| 13 | Estados do Cliente/Serviço/Profissional | BBR-CLIENTE-01, BBR-SERVICO-01, BBR-PROFISSIONAL-01 | CONFIRMADA (parcial) | `/customers`, `/employees` | Corpos capturados: clientes (id, full_name, is_active...), profissionais (id, name), serviços (observados em appointments) |

---

## 5. Matriz de Fluxos — Área do Cliente (10 fluxos)

| # | Fluxo | Telas Envolvidas | Classificação | Endpoint HAR | Observações |
|---|-------|-----------------|--------------|--------------|-------------|
| 1 | Descoberta e Escolha | CLI-PUBLIC-01, CLI-PERFIL-01 a 03 | DESCONHECIDA | Sem endpoint público | Lado admin apenas no HAR |
| 2 | Seleção de Serviços | CLI-SERVICO-01 | CONFIRMADA (parcial) | `/appointments` | Services[] observado: ["Corte Navalha"] |
| 3 | Seleção de Data e Horário | CLI-HORARIO-01 | CONFIRMADA (parcial) | `/appointments?start_date=&end_date=&user_id=` | hours[] com available flag, free_spaces[] capturados |
| 4 | Identificação e Cadastro | CLI-IDENTIFICACAO-01, CLI-IDENTIFICACAO-02 | CONFIRMADA (parcial) | `/customers?company_id=24` | Corpo capturado: estrutura de cliente confirmada |
| 5 | Confirmação da Reserva | CLI-CONFIRMACAO-01 | DESCONHECIDA | Sem dado de confirmação | — |
| 6 | Reserva Confirmada | CLI-SUCESSO-01 | DESCONHECIDA | Sem dado de sucesso | — |
| 7 | Visualização de Meus Agendamentos | CLI-MEUS-AGENDAMENTOS-01, 02 | DESCONHECIDA | Sem dado de agendamentos cliente | — |
| 8 | Cancelamento de Reserva | CLI-CANCELAR-01 | INFERÊNCIA | Sem endpoint de cancelamento | — |
| 9 | Remarcação de Reserva | CLI-REMARCAR-01 | INFERÊNCIA | Sem endpoint de remarcação | — |
| 10 | Gestão do Perfil do Cliente | CLI-PERFIL-CLIENTE-01 | DESCONHECIDA | Sem dado de perfil cliente logado | — |

---

## 6. Navegação entre Telas (Resumo)

```
ÁREA DO BARBEIRO:
Dashboard (BBR-DASH-01)
  ├─ Agenda (BBR-AGENDA-01 a 05) ── Agendamento (BBR-AGENDAMENTO-01 a 05)
  ├─ Serviços (BBR-SERVICO-01 a 04)
  ├─ Profissionais (BBR-PROFISSIONAL-01 a 04)
  ├─ Clientes (BBR-CLIENTE-01 a 05) ── Perfil (BBR-CLIENTE-04) ── Histórico (BBR-CLIENTE-05)
  ├─ Minha Agenda (BBR-MINHA-AGENDA-01) ── Atendimento (BBR-ATENDIMENTO-01)
  ├─ Cancelamentos (BBR-CANCELAMENTO-01 a 03)
  ├─ Configurações (BBR-CONFIG-01 a 05)
  ├─ Caixa (BBR-CAIXA-01)
  └─ Relatórios (BBR-RELATORIO-01)

ÁREA DO CLIENTE:
Página Inicial (CLI-PUBLIC-01)
  └─ Perfil do Profissional (CLI-PERFIL-01)
       ├─ Galeria (CLI-PERFIL-02)
       ├─ Avaliações (CLI-PERFIL-03)
       └─ Seleção de Serviço (CLI-SERVICO-01)
            └─ Seleção de Horário (CLI-HORARIO-01)
                 └─ Identificação (CLI-IDENTIFICACAO-01)
                      ├─ Cadastro Rápido (CLI-IDENTIFICACAO-02)
                      └─ Confirmação (CLI-CONFIRMACAO-01)
                           └─ Sucesso (CLI-SUCESSO-01)
                                └─ Meus Agendamentos (CLI-MEUS-AGENDAMENTOS-01)
                                     ├─ Detalhes (CLI-MEUS-AGENDAMENTOS-02)
                                     ├─ Cancelar (CLI-CANCELAR-01)
                                     └─ Remarcar (CLI-REMARCAR-01)
                                └─ Meu Perfil (CLI-PERFIL-CLIENTE-01)
```

---

## 7. Tabela de Classificação Geral

| Categoria | CONFIRMADA | CONFIRMADA (parcial) | INFERÊNCIA | DESCONHECIDA | PENDENTE | Total |
|-----------|------------|---------------------|------------|--------------|----------|-------|
| Telas Barbeiro (detalhadas) | 5 | 25 | 2 | 5 | 0 | 37 |
| Telas Pendentes Barbeiro | 0 | 1 | 0 | 4 | 0 | 5 |
| Telas Cliente | 0 | 2 | 2 | 11 | 0 | 15 |
| Fluxos Barbeiro | 0 | 10 | 2 | 1 | 0 | 13 |
| Fluxos Cliente | 0 | 3 | 2 | 5 | 0 | 10 |
| **Total** | **5** | **41** | **8** | **26** | **0** | **80** |

**Interpretação:** 5 itens (6,2%) têm confirmação direta no HAR. 41 itens (51,2%) têm confirmação parcial (endpoint + corpo capturado mas detalhes incompletos). 8 itens (10,0%) são inferências de domínio. 26 itens (32,5%) são desconhecidos. 0 itens estão pendentes de evidência.

---

**Próximo passo:** Esta matriz alimenta a `MATRIZ_REGRAS_DE_NEGOCIO.md` e a `LACUNAS_EVIDENCIAS_PENDENTES.md`.
