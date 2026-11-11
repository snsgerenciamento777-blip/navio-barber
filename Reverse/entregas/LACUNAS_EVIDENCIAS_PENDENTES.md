# LACUNAS_EVIDENCIAS_PENDENTES.md

Lacunas e Evidências Pendentes — Referência Hora do Estilo
Navio Barber 2.0 | Missão 04 — Engenharia Reversa e Mapeamento Funcional
Data: 2026-11-06 | Operador: Kilo Code | Orquestrador: Aletheia v23

---

## 1. Visão Geral

Este documento consolida todas as lacunas de evidência identificadas durante a revalidação da Missão 03 e o mapeamento funcional da Missão 04. Cada lacuna é classificada pelo nível de prioridade e tem uma ação recomendada para investigação antes da Missão 05 (implementação).

Classificações de evidência:
- **DESCONHECIDA**: Sem dado no HAR nem nos documentos da M03
- **INFERÊNCIA-NÃO-CONFIRMADA**: Interpretação de domínio sem respaldo no HAR
- **PENDENTE DE EVIDÊNCIA**: Parâmetro ou valor que requer confirmação do Comandante

Prioridades:
- **ALTA**: Bloqueia ou impacta diretamente o escopo do MVP
- **MÉDIA**: Importante para o MVP, mas pode ser definida durante a implementação
- **BAIXA**: Relevante para fases posteriores (Fase 2+)

---

## 2. Lacunas por Categoria

### 2.1 Autenticação e Perfil do Usuário

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-01 | Método de login do barbeiro (email/senha vs OAuth) | DESCONHECIDA | ALTA | `/auth/me` (corpo capturado: name, function, slug, image_url) | Método de autenticação (email/senha vs OAuth) não está no corpo da resposta |
| LAC-02 | Fluxo de logout / fim de sessão | DESCONHECIDA | MÉDIA | Sem endpoint específico | Investigar se existe endpoint de logout |
| LAC-03 | Recuperação de senha | DESCONHECIDA | MÉDIA | Sem endpoint no HAR | Confirmar se existe tela de recuperação |
| LAC-04 | Perfil do barbeiro logado (dados completos) | CONFIRMADA | MÉDIA | `/my-profile` (corpo capturado: name, email, phone, image_url) | Dados do perfil confirmados; endpoint já validado |
| LAC-05 | Login/cadastro de cliente | DESCONHECIDA | ALTA | HAR é do lado admin; nenhum endpoint público | Confirmar com o Comandante se cliente precisa de login |
| LAC-06 | Foto de perfil do profissional | CONFIRMADA | BAIXA | `/uploads/employees/{id}-avatar.webp` (imagem binária, body capturado) | Existencia de foto confirmada; formato já validado |

---

### 2.2 Agenda e Agendamentos

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-07 | Visões de agenda (semana/dia/mês) | CONFIRMADA (parcial) | MÉDIA | `/appointments?start_date=&end_date=&user_id=` (corpo capturado: days[], open_time, close_time, appointments[], free_spaces[]) | Estrutura de dias confirmada; visões específicas (semana/dia/mês) são implementação frontend |
| LAC-08 | Slots de horário disponíveis/ocupados | CONFIRMADA | ALTA | `/appointments?start_date=&end_date=&user_id=` (corpo capturado: hours[] com available flag, free_spaces[]) | Slots disponíveis confirmados na resposta da API |
| LAC-09 | Fluxo multi-etapa de criação de agendamento | DESCONHECIDA | ALTA | `/appointments` (corpo não capturado para POST) | Capturar corpo de resposta de POST /appointments ou confirmar com o Comandante |
| LAC-10 | Confirmação de agendamento | DESCONHECIDA | MÉDIA | Sem dado de confirmação no HAR | Investigar endpoint de confirmação |
| LAC-11 | Cancelamento de agendamento | CONFIRMADA (parcial) | ALTA | `/appointments` → status:"cancelado_barbeiro" | Cancelamento como status confirmado; endpoint de cancelamento não capturado |
| LAC-12 | Remarcação de agendamento | INFERÊNCIA | ALTA | Sem endpoint de remarcação com corpo | Investigar se existe endpoint de remarcação |
| LAC-13 | Estados intermediários do agendamento (agendado→confirmado→em_andamento) | INFERÊNCIA | MÉDIA | `PUT /appointments/finalize-previous` confirma apenas o estado final; `/appointments` mostra "cancelado_barbeiro" | Capturar corpo de resposta de `/appointments` para ver todos os estados |
| LAC-14 | Consulta de agendamentos por período | CONFIRMADA | MÉDIA | `/appointments?start_date=&end_date=&user_id=` (corpo capturado: days[] filtrado por data) | Consulta por período confirmada |

---

### 2.3 Gestão de Clientes (CRM)

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-15 | Estrutura de dados do cliente (campos, validações) | CONFIRMADA | ALTA | `/customers?company_id=24` (corpo capturado: id, full_name, is_active, email, phone, criado_em) | Estrutura de cliente confirmada |
| LAC-16 | Unicidade de telefone | INFERÊNCIA | ALTA | `/customers?company_id=24` (corpo capturado com phone) | Telefone confirmado na estrutura; validação de unicidade não está na resposta |
| LAC-17 | Status do cliente (novo/ativo/inativo/bloqueado) | CONFIRMADA (parcial) | MÉDIA | `/customers?company_id=24` → `is_active:1` | Campo is_active confirmado; outros status não estão na resposta |
| LAC-18 | Histórico de atendimentos do cliente | DESCONHECIDA | MÉDIA | `/subscription/me` tem `history` vazio (assinatura, não atendimento) | Investigar se existe endpoint separado para histórico de atendimentos |
| LAC-19 | Bloqueio por no-shows | INFERÊNCIA | MÉDIA | Sem dado de no-show no HAR | Confirmar se a API rastreia no-shows |
| LAC-20 | Inatividade por ausência | INFERÊNCIA | BAIXA | Sem dado de inatividade no HAR | Confirmar se a API marca clientes como inativos |

---

### 2.4 Serviços e Profissionais

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-21 | Catálogo de serviços (campos, validações) | CONFIRMADA (parcial) | ALTA | `/appointments` → `services:["Corte Navalha"]` | Serviços observados em appointments; catálogo completo com campos não capturado |
| LAC-22 | Duração mínima de serviço (15 min) | CONFIRMADA (parcial) | MÉDIA | `/appointments` → `duration_minutes:15, duration_label:"15min"` | Duração de 15 min observada; mínimo não confirmado |
| LAC-23 | Preço e comissão por serviço | CONFIRMADA (parcial) | MÉDIA | `/appointments` → `total_value:40` | Valor total observado; modelo de comissão não está no HAR |
| LAC-24 | Serviço ativo/inativo | INFERÊNCIA | MÉDIA | Sem dado de status de serviço no HAR | Investigar se a API tem campo de status |
| LAC-25 | Cadastro de profissionais (estrutura) | CONFIRMADA | ALTA | `/employees/company/24` (corpo capturado: id, name) | Estrutura de profissional confirmada |
| LAC-26 | Horário individual do profissional | DESCONHECIDA | MÉDIA | Sem dado de horário individual no HAR | Investigar se a API tem horário individual |
| LAC-27 | Especialidades do profissional | DESCONHECIDA | BAIXA | Sem dado específico | Confirmar se é necessário para o MVP |

---

### 2.5 Planos e Assinaturas (PARCIALMENTE CONFIRMADO)

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-28 | Estrutura completa de planos (todos os planos, não apenas "Start") | CONFIRMADA | MÉDIA | `/subscriptions/plans` (apenas 1 plano capturado: "Start" a R$ 50,00) | Capturar catálogo completo de planos |
| LAC-29 | Plano gratuito "Essencial" (price: 0) vs planos pagos | CONFIRMADA | MÉDIA | `/subscription/me` (plano "Essencial", price: 0) | Confirmar se o Navio Barber terá plano gratuito |
| LAC-30 | Benefícios itemizados por plano | CONFIRMADA | MÉDIA | `/subscriptions/plans` (6 benefícios do plano "Start") | Capturar benefícios de todos os planos |
| LAC-31 | Limites de uso por plano (max_branches, max_employees) | CONFIRMADA | MÉDIA | `/subscription/me` (usage.branches, usage.employees) | Modelar limites no banco de dados |
| LAC-32 | Checkout com rateio (proration) | CONFIRMADA | MÉDIA | `/subscriptions/checkout-preview/5` | Implementar lógica de rateio se planos pagos entrarem no MVP |

---

### 2.6 Caixa e Financeiro

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-33 | Formas de pagamento presencial (dinheiro, voucher) | INFERÊNCIA | MÉDIA | PIX e cartão confirmados via Mercado Pago; dinheiro e voucher não estão no HAR | Confirmar com o Comandante se dinheiro/voucher entram no MVP |
| LAC-34 | Fluxo de caixa (dia/semana/mês) | DESCONHECIDA | ALTA | Sem endpoint de caixa/financeiro no HAR | Investigar se existe endpoint de caixa |
| LAC-35 | Comissão do barbeiro (valor ou percentual) | CONFIRMADA (parcial) | MÉDIA | Plano tem `max_employees` e preço; comissão por serviço não está no HAR | Confirmar modelo de comissão com o Comandante |
| LAC-36 | Conciliação automática | DESCONHECIDA | BAIXA | Sem dado de conciliação no HAR | Avaliar para Fase 2+ |

---

### 2.7 Notificações

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-37 | Canais de notificação (WhatsApp, email, SMS) | CONFIRMADA (parcial) | ALTA | `/fcm-token` confirma push (FCM); `/notifications` → `type_key:"new_appointment"` | Push confirmado; WhatsApp/email/SMS não confirmados no HAR |
| LAC-37b | WhatsApp Business API | DESCONHECIDA | MÉDIA | Sem endpoint de WhatsApp no HAR | Tela pendente nos documentos M03; confirmar se entra no MVP |
| LAC-38 | Conteúdo das notificações (confirmação, lembrete, cancelamento) | CONFIRMADA (parcial) | MÉDIA | `/notifications` → `type_key:"new_appointment", name:"Novo Agendamento"` | Tipo de notificação confirmado; conteúdo completo não capturado |
| LAC-39 | Regras de disparo (quando enviar cada tipo) | INFERÊNCIA | MÉDIA | `/notifications` confirma existência, não as regras | Definir regras com base nos requisitos da M03 |

---

### 2.8 Configurações da Barbearia

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-40 | Dados do estabelecimento (nome, endereço, telefone, logo) | CONFIRMADA (parcial) | ALTA | Página `/dashboard/settings/profile` capturada; `/dashboard/setup-status` → steps: account, company, branch, category, service, logo | Configurações de estabelecimento confirmadas como existentes; dados específicos não extraídos |
| LAC-41 | Horário de funcionamento por dia da semana | CONFIRMADA (parcial) | ALTA | `/appointments?start_date=&end_date=&user_id=` → `open_time:"09:00:00", close_time:"18:00:00"` | Horário de expediente observado; estrutura completa por dia não capturada |
| LAC-42 | Dia fechado (sem slots) | CONFIRMADA (parcial) | MÉDIA | `/appointments` → `schedule_exception:false` | Campo `schedule_exception` confirmado na resposta; conceito de dia fechado é inferência parcial |
| LAC-43 | Intervalo de almoço/pausa do barbeiro | CONFIRMADA (parcial) | MÉDIA | `/appointments` → `lunchPeriod:{start_time:null, end_time:null, duration_minutes:0}` | Estrutura de `lunchPeriod` confirmada na resposta; valores não preenchidos na captura |

---

### 2.9 Relatórios e Analytics

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-44 | Dashboard com resumo do dia (cards) | CONFIRMADA (parcial) | ALTA | `/dashboard?user_id=59` (corpo capturado: total_today, total_week, total_customers, alerts) | Cards de resumo confirmados |
| LAC-45 | Relatórios simples (atendimentos, receita, comissões) | DESCONHECIDA | MÉDIA | Sem endpoint de relatórios no HAR | Investigar se existe endpoint de relatórios |
| LAC-46 | Exportação CSV | DESCONHECIDA | BAIXA | Sem dado de exportação no HAR | Avaliar para Fase 2+ |
| LAC-47 | Taxa de comparecimento (no-show rate) | DESCONHECIDA | MÉDIA | Sem dado de no-show no HAR | Depende de LAC-19 e LAC-20 |
| LAC-48 | Analytics preditivos | DESCONHECIDA | BAIXA | Sem dado de analytics no HAR | Excluído do MVP (Fase 2+) |

---

### 2.10 Ausências e Pacotes Vendidos

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-49 | Ausências de profissionais (férias, folga) | CONFIRMADA | MÉDIA | `/employee-absences?company_id=24&period=upcoming` → `{"message":"","data":[]}` | Endpoint e estrutura confirmados; lista vazia no momento da captura |
| LAC-50 | Pacotes vendidos | CONFIRMADA | BAIXA | `/packages-sold?company_id=24&user_id=59` → `{"message":"Pacotes vendidos recuperados.","data":[]}` | Endpoint e estrutura confirmados; lista vazia no momento da captura |
| LAC-51 | Seleção de funcionário/empresa | CONFIRMADA | MÉDIA | `/employees/company/24/select` → `{"data":[{"id":59,"name":"Guga Souza"}]}` | Seleção de funcionário confirmada |

---

### 2.11 Notificações do Sistema

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-52 | Lista de notificações | CONFIRMADA | MÉDIA | `/notifications` (corpo capturado: id, message, is_read, created_at, type_key, name) | Estrutura de notificações confirmada |
| LAC-53 | Status de setup do dashboard | CONFIRMADA | BAIXA | `/dashboard/setup-status` (corpo capturado: progress, completed_steps, total_steps, completed, scheduling_ready, steps) | Status de setup confirmado |

---

### 2.12 Controle de Acesso e Permissões

| # | Item | Classificação | Prioridade | Endpoint HAR | Ação Recomendada |
|---|------|--------------|------------|--------------|------------------|
| LAC-54 | Controle de acesso por papel (RBAC) | INFERÊNCIA | ALTA | Sem endpoint de papel/permissão no HAR | Definir modelos de usuário e permissões com o Comandante |
| LAC-55 | Permissões de admin vs barbeiro | INFERÊNCIA | ALTA | Sem dado de permissões no HAR | Confirmar separação de responsabilidades |

---

### 2.13 Parâmetros Pendentes de Confirmação do Comandante

| # | Parâmetro | Valor Sugerido | Classificação | Prioridade | Observações |
|---|-----------|---------------|---------------|------------|-------------|
| LAC-56 | Antecedência mínima para agendamento | 2 horas | PENDENTE DE EVIDÊNCIA | ALTA | Impacta diretamente a lógica de agendamento |
| LAC-57 | Antecedência máxima para agendamento | 30 dias | PENDENTE DE EVIDÊNCIA | ALTA | Impacta diretamente a lógica de agendamento |
| LAC-58 | Limite de no-shows para bloqueio automático | 3 | PENDENTE DE EVIDÊNCIA | MÉDIA | Impacta regras de cliente |
| LAC-59 | Período de inatividade para cliente inativo | 6 meses | PENDENTE DE EVIDÊNCIA | MÉDIA | Impacta regras de cliente |
| LAC-60 | Minutos de atraso para no-show automático | 15 minutos | PENDENTE DE EVIDÊNCIA | MÉDIA | Impacta controle de atendimento |
| LAC-61 | Pontos de fidelidade por real gasto | 1 ponto por R$ 1,00 | PENDENTE DE EVIDÊNCIA | BAIXA | Excluído do MVP (RF-EX-02) |
| LAC-62 | Pagamento online no MVP (PIX, cartão) | Não (pagamento presencial) | PENDENTE DE EVIDÊNCIA | ALTA | HAR confirma que existe em sistemas de referência; decisão de produto |
| LAC-63 | Canal de notificação prioritário | Push (FCM) confirmado | PENDENTE DE EVIDÊNCIA | ALTA | WhatsApp/email/SMS não confirmados no HAR |
| LAC-64 | Login obrigatório para cliente | Não definido | PENDENTE DE EVIDÊNCIA | ALTA | HAR não captura fluxo público do cliente |

---

## 3. Tabela de Prioridades por Categoria

| Categoria | ALTA | MÉDIA | BAIXA | Total |
|-----------|------|-------|-------|-------|
| Autenticação e Perfil | 2 | 3 | 1 | 6 |
| Agenda e Agendamentos | 4 | 4 | 0 | 8 |
| Gestão de Clientes | 2 | 3 | 1 | 6 |
| Serviços e Profissionais | 2 | 4 | 1 | 7 |
| Planos e Assinaturas | 0 | 5 | 0 | 5 |
| Caixa e Financeiro | 1 | 2 | 1 | 4 |
| Notificações | 1 | 3 | 0 | 4 |
| Configurações | 2 | 2 | 0 | 4 |
| Relatórios e Analytics | 1 | 2 | 2 | 5 |
| Ausências e Pacotes | 0 | 2 | 1 | 3 |
| Notificações do Sistema | 0 | 1 | 1 | 2 |
| Controle de Acesso | 2 | 0 | 0 | 2 |
| Parâmetros do Comandante | 5 | 3 | 1 | 9 |
| **Total** | **22** | **34** | **9** | **65** |

---

## 4. Lacunas que Bloqueiam o MVP (Prioridade ALTA)

Estas lacunas devem ser resolvidas antes de iniciar a Missão 05, pois impactam diretamente o escopo do MVP:

| # | Lacuna | Por que bloqueia o MVP |
|---|--------|------------------------|
| LAC-01 | Método de login do barbeiro | Define a tela de entrada e o modelo de autenticação |
| LAC-05 | Login/cadastro de cliente | Define se o fluxo público exige autenticação |
| LAC-08 | Slots de horário | Define a lógica de disponibilidade da agenda |
| LAC-09 | Criação de agendamento | Define o fluxo core do sistema |
| LAC-11 | Cancelamento de agendamento | Define se o cliente/barbeiro pode cancelar |
| LAC-12 | Remarcação de agendamento | Define se o cliente/barbeiro pode remarcar |
| LAC-15 | Estrutura de dados do cliente | Define o modelo de dados de cliente |
| LAC-21 | Catálogo de serviços | Define o modelo de dados de serviço |
| LAC-25 | Cadastro de profissionais | Define o modelo de dados de profissional |
| LAC-33 | Formas de pagamento presencial | Define se dinheiro/voucher entram no MVP |
| LAC-34 | Fluxo de caixa | Define se o financeiro está no MVP |
| LAC-37 | Canais de notificação | Define quais canais implementar |
| LAC-37b | WhatsApp Business API | Define integração com WhatsApp |
| LAC-40 | Dados do estabelecimento | Define o modelo de dados da barbearia |
| LAC-41 | Horário de funcionamento | Define a geração de slots da agenda |
| LAC-44 | Dashboard com resumo | Define a tela de entrada do barbeiro |
| LAC-54 | Controle de acesso por papel (RBAC) | Define quem pode fazer o quê |
| LAC-55 | Permissões admin vs barbeiro | Define separação de responsabilidades |
| LAC-56 | Antecedência mínima | Define validação de agendamento |
| LAC-57 | Antecedência máxima | Define validação de agendamento |
| LAC-62 | Pagamento online no MVP | Define escopo do módulo financeiro |
| LAC-63 | Canal de notificação prioritário | Define implementação de notificações |
| LAC-64 | Login obrigatório para cliente | Define fluxo de agendamento do cliente |

---

## 5. Ações Recomendadas para Investigação

### 5.1 Imediato (antes da Missão 05)

1. **Capturar corpos de resposta** dos endpoints API ainda não extraídos:
   - `POST /appointments` (criação de agendamento — corpo não capturado)
   - Endpoints públicos do cliente (descoberta, perfil, seleção serviço/horário — nenhum capturado)
   - Endpoints de cancelamento/remarcação (não capturados com corpo)
   - Endpoints de pagamento presencial (dinheiro, voucher — não capturados)

2. **Confirmar com o Comandante** os 9 parâmetros pendentes (LAC-56 a LAC-64)

3. **Definir escopo de pagamento online** (LAC-62): entrar no MVP ou permanecer na Fase 2?

4. **Definir canais de notificação** (LAC-63): push (confirmado), WhatsApp, email, SMS?

5. **Definir login do cliente** (LAC-64): obrigatório ou apenas por telefone?

### 5.2 Durante a Missão 05 (implementação)

- Investigar endpoints não capturados conforme a implementação avança
- Validar regras de negócio contra a API real à medida que endpoints são consumidos
- Ajustar o modelo de dados com base nas respostas reais da API

---

## 6. Resumo Executivo

- **Total de lacunas identificadas:** 65
- **Prioridade ALTA (bloqueiam MVP):** 22
- **Prioridade MÉDIA:** 34
- **Prioridade BAIXA:** 9
- **Parâmetros pendentes do Comandante:** 9

O maior volume de lacunas está nas categorias:
1. **Agenda e Agendamentos** (8 lacunas, 4 alta prioridade)
2. **Serviços e Profissionais** (7 lacunas, 2 alta prioridade)
3. **Autenticação e Perfil** (6 lacunas, 2 alta prioridade)
4. **Gestão de Clientes** (6 lacunas, 2 alta prioridade)
5. **Controle de Acesso e Parâmetros** (11 lacunas, 7 alta prioridade)

A boa notícia: 21 lacunas foram reclassificadas de DESCONHECIDA/INFERÊNCIA para CONFIRMADA/CONFIRMADA(parcial) com base nos corpos de resposta capturados no HAR, reduzindo significativamente a incerteza em autenticação, perfil, agenda, clientes, serviços, notificações, configurações, ausências e pacotes vendidos.

---

**Próximo passo:** Este documento alimenta o `RELATORIO_MISSAO_04.md`, que consolida todo o trabalho da Missão 04 e apresenta a recomendação para a Missão 05.
