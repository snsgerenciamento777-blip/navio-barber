# ESPECIFICACAO_FUNCIONAL_MVP.md — Especificação Funcional do MVP

**Versão:** 1.0  
**Data:** 2026-11-07  
**Autor:** Kilo Code (Orquestração: Aletheia v23)  
**Status:** Fase 0 — Spec Kit (especificação apenas, sem implementação)  
**Base:** MAPA_FUNCIONAL_HORA_DO_ESTILO.md, REQUISITOS_FUNCIONAIS_MVP.md, AUDITORIA_FINAL_MISSAO_04.md, DECISOES_DO_COMANDANTE.md

---

## 1. Visão Geral

Este documento especifica funcionalmente cada uma das 20 funcionalidades candidatas ao MVP do Navio Barber 2.0, organizadas em 4 grupos. Cada funcionalidade indica seu nível de evidência (CONFIRMADA, CONFIRMADA parcial, INFERÊNCIA, DESCONHECIDA) com base na engenharia reversa do Hora do Estilo e nas decisões aprovadas pelo Comandante (D-01 a D-08).

**Níveis de evidência:**
- **CONFIRMADA**: Endpoint e corpo de resposta capturados no HAR.
- **CONFIRMADA (parcial)**: Endpoint capturado, mas detalhes incompletos (inferência parcial).
- **INFERÊNCIA**: Interpretação de domínio sem respaldo direto no HAR.
- **DESCONHECIDA**: Sem dado no HAR nem nos documentos de referência.

---

## 2. Grupo 1 — Autenticação e Perfil (2 itens)

### 2.1 Login do Barbeiro (FUNC-01)

**Evidência:** CONFIRMADA (parcial)  
**Endpoint:** `GET /auth/me` (corpo capturado: name, function, slug, image_url)  
**Descrição:** O barbeiro autentica-se no sistema para acessar o dashboard e as operações da barbearia.  
**Escopo do MVP:**
- Tela de login do barbeiro (email/telefone + senha)
- Validação de credenciais contra a API
- Sessão persistente após login bem-sucedido
- Redirecionamento para dashboard após autenticação
**Decisão vinculante:** D-02 (cliente não precisa de login) — este requisito aplica-se apenas ao barbeiro.
**Fora do escopo:** Recuperação de senha, login social/OAuth, cadastro de novo barbeiro via app.

### 2.2 Perfil do Barbeiro Logado (FUNC-02)

**Evidência:** CONFIRMADA  
**Endpoint:** `GET /my-profile` (corpo capturado: name, email, phone, image_url)  
**Descrição:** O barbeiro visualiza e edita seus dados pessoais de perfil.  
**Escopo do MVP:**
- Exibição de nome, email, telefone e foto de perfil
- Edição de dados do perfil (nome, telefone, email)
- Upload/atualização de foto de perfil
**Fora do escopo:** Alteração de senha, configuração de preferências de notificação do perfil pessoal.

---

## 3. Grupo 2 — Agendamento e Atendimento (6 itens)

### 3.1 Dashboard com Resumo do Dia (FUNC-03)

**Evidência:** CONFIRMADA (parcial)  
**Endpoint:** `GET /dashboard?user_id=59` (corpo capturado: total_today, total_week, total_customers, alerts, hours[], available flag)  
**Descrição:** Tela de entrada do barbeiro com cards de resumo e lista de próximos atendimentos.  
**Escopo do MVP:**
- Cards: agendamentos de hoje, clientes atendidos, receita do dia, taxa de ocupação
- Lista de próximos atendimentos (próximas 2 horas)
- Alertas do sistema
**Decisão vinculante:** D-04 (antecedência mínima 2h) afeta a validação de novos agendamentos a partir do dashboard.

### 3.2 Visualização de Agenda — Slots Disponíveis (FUNC-04)

**Evidência:** CONFIRMADA  
**Endpoint:** `GET /appointments` (corpo capturado: hours[] com available flag, free_spaces[], days[], open_time, close_time)  
**Descrição:** Calendário visual com slots de horário, diferenciando ocupados e disponíveis.  
**Escopo do MVP:**
- Visões: semana, dia, mês
- Blocos coloridos por status do agendamento
- Indicador de horário atual ("agora")
- Slots disponíveis clicáveis para novo agendamento
- Slots ocupados bloqueados para agendamento
**Decisão vinculante:** D-05 (antecedência máxima 30 dias) limita o alcance do calendário.

### 3.3 Consulta de Agendamentos por Período (FUNC-05)

**Evidência:** CONFIRMADA  
**Endpoint:** `GET /appointments?start_date=&end_date=&user_id=` (corpo capturado: days[] filtrado por data)  
**Descrição:** Consulta de agendamentos filtrados por período de data.  
**Escopo do MVP:**
- Filtro por data de início e fim
- Listagem de agendamentos no período selecionado
- Exibição de status de cada agendamento

### 3.4 Finalização de Agendamentos Anteriores (FUNC-06)

**Evidência:** CONFIRMADA  
**Endpoint:** `PUT /appointments/finalize-previous` (corpo capturado: mensagem de sucesso)  
**Descrição:** Marca agendamentos pendentes de períodos anteriores como concluídos.  
**Escopo do MVP:**
- Identificação de agendamentos em estado intermediário não concluído
- Operação de finalização em lote
- Confirmação de sucesso da operação

### 3.5 Cadastro de Clientes (FUNC-07)

**Evidência:** CONFIRMADA (parcial)  
**Endpoint:** `GET /customers?company_id=24` (corpo capturado: id, full_name, is_active, email, phone, criado_em)  
**Descrição:** Cadastro, edição e visualização de clientes da barbearia.  
**Escopo do MVP:**
- Nome e telefone obrigatórios (telefone único na base)
- Email, data de nascimento, preferências e observações opcionais
- Status do cliente: novo, ativo, inativo, bloqueado
- Histórico de atendimentos do cliente visível
**Decisão vinculante:** D-02 (cliente agenda por telefone, sem login) — cadastro é feito pelo barbeiro, não pelo cliente.

### 3.6 Cadastro de Profissionais (FUNC-08)

**Evidência:** CONFIRMADA (parcial)  
**Endpoint:** `GET /employees/company/24` (corpo capturado: id, name)  
**Descrição:** Cadastro e listagem de profissionais da barbearia.  
**Escopo do MVP:**
- Nome do profissional obrigatório
- Listagem de profissionais ativos
- Ativação/inativação de profissional
**Fora do escopo:** Especialidades, horário individual, comissão por profissional (dados não capturados no HAR).

---

## 4. Grupo 3 — Cadastros e Configurações da Barbearia (7 itens)

### 4.1 Seleção de Funcionário/Empresa (FUNC-09)

**Evidência:** CONFIRMADA  
**Endpoint:** `GET /employees/company/24/select` (corpo capturado: id, name)  
**Descrição:** Seleção do funcionário logado e da empresa/barbearia de contexto.  
**Escopo do MVP:**
- Seleção de empresa/barbearia (multi-tenancy base)
- Seleção de funcionário dentro da empresa
- Persistência da seleção na sessão

### 4.2 Catálogo de Planos e Assinaturas (FUNC-10)

**Evidência:** CONFIRMADA  
**Endpoint:** `GET /subscriptions/plans` e `GET /subscription/me` (corpos capturados)  
**Descrição:** Visualização de planos disponíveis e assinatura ativa da barbearia.  
**Escopo do MVP:**
- Listagem de planos (nome, preço, frequência, limites)
- Exibição do plano ativo e uso (branches, employees)
- Visualização de benefícios por plano
**Decisão vinculante:** D-01 (sem pagamento online) — checkout de plano não está no MVP.

### 4.3 Status de Setup do Dashboard (FUNC-11)

**Evidência:** CONFIRMADA  
**Endpoint:** `GET /dashboard/setup-status` (corpo capturado: progress, completed_steps, total_steps, completed, scheduling_ready, steps)  
**Descrição:** Acompanhamento do progresso de configuração inicial da barbearia.  
**Escopo do MVP:**
- Exibição de progresso de setup (percentual)
- Lista de passos concluídos e pendentes
- Indicador se o agendamento está pronto (scheduling_ready)

### 4.4 Dados do Estabelecimento (FUNC-12)

**Evidência:** CONFIRMADA (parcial)  
**Endpoint:** Página `/dashboard/settings/profile` + `GET /dashboard/setup-status` (steps: account, company, branch, category, service, logo)  
**Descrição:** Dados cadastrais da barbearia (nome, endereço, telefone, email, logo).  
**Escopo do MVP:**
- Nome, endereço, telefone, email da barbearia
- Upload de logo da barbearia
- Categoria e ramo de atuação

### 4.5 Horário de Funcionamento (FUNC-13)

**Evidência:** CONFIRMADA (parcial)  
**Endpoint:** `GET /appointments` (corpo capturado: open_time, close_time)  
**Descrição:** Horário de abertura e fechamento por dia da semana.  
**Escopo do MVP:**
- Horário de abertura e fechamento por dia da semana
- Dias da semana com expediente definido
**Decisão vinculante:** D-04 e D-05 afetam a geração de slots dentro do horário de funcionamento.

### 4.6 Dia Fechado (schedule_exception) (FUNC-14)

**Evidência:** CONFIRMADA (parcial)  
**Endpoint:** `GET /appointments` (corpo capturado: schedule_exception:false)  
**Descrição:** Marcação de dias em que a barbearia está fechada (sem slots gerados).  
**Escopo do MVP:**
- Marcação de dias fechados (feriados, férias, manutenção)
- Dias fechados não geram slots de agendamento

### 4.7 Intervalo de Almoço (lunchPeriod) (FUNC-15)

**Evidência:** CONFIRMADA (parcial)  
**Endpoint:** `GET /appointments` (corpo capturado: lunchPeriod: {start_time, end_time, duration_minutes})  
**Descrição:** Intervalo de pausa/almoço do profissional dentro do expediente.  
**Escopo do MVP:**
- Horário de início e fim do intervalo de almoço
- Duração do intervalo em minutos
- Slots não gerados durante o intervalo

---

## 5. Grupo 4 — Operações, Notificações e Pacotes (5 itens)

### 5.1 Pagamento Online (FUNC-16)

**Evidência:** CONFIRMADA (no HAR)  
**Decisão vinculante:** D-01 — NÃO haverá pagamento online no MVP.  
**Status:** EXCLUÍDO do MVP.  
**Justificativa:** O pagamento online exige integração com Mercado Pago, cuidados com segurança de dados financeiros e conformidade LGPD. Adiciona complexidade e custo ao lançamento inicial.  
**Plano:** Adicionado à Fase 2+.

### 5.2 Notificações Push (FCM) (FUNC-17)

**Evidência:** CONFIRMADA  
**Endpoint:** `POST /fcm-token` (corpo capturado: token salvo com sucesso)  
**Descrição:** Notificações push via Firebase Cloud Messaging.  
**Escopo do MVP:**
- Registro de token FCM do dispositivo
- Notificação de novo agendamento
- Notificação de cancelamento
- Notificação de remarcação
- Notificação de lembrete
**Limitação documentada:** Clientes sem aplicativo instalado, que negaram permissão ou com token inválido não recebem push. Essa alternativa está fora do escopo inicial sem custo adicional.

### 5.3 Lista de Notificações (FUNC-18)

**Evidência:** CONFIRMADA  
**Endpoint:** `GET /notifications` (corpo capturado: id, message, is_read, created_at, type_key, name)  
**Descrição:** Listagem de notificações recebidas pelo usuário.  
**Escopo do MVP:**
- Listagem de notificações com data/hora
- Marcagem como lida/não lida
- Tipo de notificação (novo agendamento, cancelamento, lembrete, etc.)

### 5.4 Ausências de Profissionais (FUNC-19)

**Evidência:** CONFIRMADA  
**Endpoint:** `GET /employee-absences?company_id=24&period=upcoming` (corpo capturado: data array)  
**Descrição:** Gerenciamento de ausências de profissionais (férias, folga).  
**Escopo do MVP:**
- Listagem de ausências próximas
- Registro de ausência de profissional
- Ausências afetam disponibilidade de slots

### 5.5 Pacotes Vendidos (FUNC-20)

**Evidência:** CONFIRMADA  
**Endpoint:** `GET /packages-sold?company_id=24&user_id=59` (corpo capturado: data array)  
**Descrição:** Visualização de pacotes vendidos (associações cliente-serviço).  
**Escopo do MVP:**
- Listagem de pacotes vendidos
- Visualização de dados básicos do pacote (cliente, serviço, data)

---

## 6. Funcionalidades Fora do MVP (Fase 2+)

| Funcionalidade | Motivo da Exclusão |
|---|---|
| Área pública do cliente (descoberta, perfil, seleção de serviço/horário) | Zero confirmações no HAR; área pública é DESCONHECIDA/INFERÊNCIA |
| Relatórios detalhados e exportação CSV | Sem endpoint de relatórios no HAR |
| Analytics preditivos | Excluído (RF-EX-04, Fase 2+) |
| Pontos de fidelidade | Excluído (RF-EX-02) |
| WhatsApp Business API | Sem endpoint no HAR; custo por mensagem |
| Email/SMS | Sem endpoint no HAR; custo por envio |
| Emissão de notas fiscais (NF-e/NFC-e) | Não detalhada no HAR |
| Pagamento online integrado | D-01: excluído do MVP (apenas pagamento presencial) |
| Multi-unidade (franquias/redes) | Excluído (RF-EX-05, Fase 3) |
| App mobile nativo | Excluído (RF-EX-06, PWA na web na Fase 2) |

---

## 7. Rastreabilidade com Decisões do Comandante

| Decisão | Funcionalidades Afetadas |
|---------|-------------------------|
| D-01 (sem pagamento online) | FUNC-16 excluído; módulo financeiro registra apenas pagamento presencial |
| D-02 (cliente sem login) | Área pública do cliente fora do MVP; cadastro de cliente feito pelo barbeiro |
| D-03 (push prioritário) | FUNC-17 e FUNC-18 baseadas em FCM; alternativas documentadas como limitação |
| D-04 (antecedência mínima 2h) | FUNC-03, FUNC-04, FUNC-05 — validação de agendamento |
| D-05 (antecedência máxima 30 dias) | FUNC-04 — alcance do calendário |
| D-06 (bloqueio após 3 no-shows) | FUNC-07 — status do cliente afeta capacidade de agendar |
| D-07 (inativo após 6 meses) | FUNC-07 — classificação de cliente inativo |
| D-08 (no-show após 15 min) | FUNC-04, FUNC-05, FUNC-06 — liberação de slot e finalização |

---

⚓ **Navio Barber 2.0 — Navegar com evidências, construir com precisão.**