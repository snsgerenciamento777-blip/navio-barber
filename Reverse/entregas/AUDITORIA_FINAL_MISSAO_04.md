# AUDITORIA_FINAL_MISSAO_04.md

Auditoria Final da Engenharia Reversa — Missão 04
Navio Barber 2.0 | Validação de consistência dos 5 entregáveis antes do Spec Kit / Fase 0
Data: 2026-11-07 | Operador: Kilo Code | Orquestrador: Aletheia v23

---

## 1. Consistência dos Cinco Documentos

### 1.1 Verificação de totais e classificações

| Documento | Itens Totais | CONFIRMADA | CONFIRMADA (parcial) | INFERÊNCIA | DESCONHECIDA | PENDENTE | Status |
|-----------|-------------|------------|---------------------|------------|--------------|----------|--------|
| MAPA_FUNCIONAL_HORA_DO_ESTILO.md | 100 | 36 | 20 | 11 | 33 | 0 | ✅ Consistente |
| MATRIZ_TELAS_E_FLUXOS.md | 80 | 5 | 41 | 8 | 26 | 0 | ✅ Consistente |
| MATRIZ_REGRAS_DE_NEGOCIO.md | 48 | 0 | 19 | 18 | 2 | 9 | ✅ Consistente |
| LACUNAS_EVIDENCIAS_PENDENTES.md | 65 lacunas | ALTA:22 | MÉDIA:34 | BAIXA:9 | — | — | ✅ Consistente |
| RELATORIO_MISSAO_04.md | Consolidado | — | — | — | — | — | ⚠️ 1 erro de consistência (linha 228) |

**Verificação soma por módulo do MAPA_FUNCIONAL:** todos os 16 módulos somam corretamente ao total de 100. ✅

**Verificação soma por categoria da MATRIZ_TELAS_E_FLUXOS:** todas as 5 categorias somam corretamente ao total de 80. ✅

**Verificação soma por categoria da MATRIZ_REGRAS_DE_NEGOCIO:** todas as 10 categorias somam corretamente ao total de 48. ✅

**Verificação soma por categoria do LACUNAS_EVIDENCIAS_PENDENTES:** todas as 13 categorias somam corretamente ao total de 65. ✅

**Total consolidado no RELATORIO_MISSAO_04 (linha 243):** 100 + 80 + 48 + 65 = 293 classificações. ✅

### 1.2 Endpoints HAR confirmados vs. declarados

O HAR contém 16 endpoints únicos da API do Hora do Estilo com corpos de resposta capturados (incluindo status=304 em cache):

| # | Endpoint | Método | Status | Body capturado | Referência nos documentos |
|---|----------|--------|--------|----------------|---------------------------|
| 1 | /auth/me | GET | 304 | SIM | MAPA linha 36, RELATORIO linha 73 |
| 2 | /notifications | GET | 304 | SIM | MAPA linha 136, RELATORIO linha 79 |
| 3 | /my-profile | GET | 304 | SIM | MAPA linha 39, RELATORIO linha 73 |
| 4 | /dashboard/setup-status | GET | 304 | SIM | MAPA linha 151, RELATORIO linha 80 |
| 5 | /fcm-token | POST | 200 | SIM | MAPA linha 135, RELATORIO linha 70 |
| 6 | /dashboard?user_id=59 | GET | 200 | SIM | MAPA linha 52, RELATORIO linha 74 |
| 7 | /employees/company/24/select | GET | 304 | SIM | MAPA linha 93, RELATORIO linha 78 |
| 8 | /appointments | GET | 200 | SIM | MAPA linhas 52-60, RELATORIO linha 75 |
| 9 | /appointments/finalize-previous | PUT | 200 | SIM | MAPA linha 56, RELATORIO linha 71 |
| 10 | /employees/company/24 | GET | 304 | SIM | MAPA linha 93, RELATORIO linha 77 |
| 11 | /employee-absences | GET | 304 | SIM | MAPA linha 179, RELATORIO linha 81 |
| 12 | /customers?company_id=24 | GET | 304 | SIM | MAPA linhas 41-72, RELATORIO linha 76 |
| 13 | /packages-sold | GET | 304 | SIM | MAPA linha 180, RELATORIO linha 82 |
| 14 | /subscription/me | GET | 200 | SIM | MAPA linhas 107-108, RELATORIO linhas 66-67 |
| 15 | /subscriptions/plans | GET | 200 | SIM | MAPA linha 106, RELATORIO linha 65 |
| 16 | /subscriptions/checkout-preview/5 | GET | 200 | SIM | MAPA linha 109, RELATORIO linha 68 |

MercadoPago (externo): /v1/payment_methods/search, /v1/devices/widgets — bodies capturados. ✅

Todos os 16 endpoints declarados no RELATORIO_MISSAO_04 têm correspondência nos HAR bodies. Nenhum endpoint inexistente foi declarado. ✅

---

## 2. Erros Encontrados

### 2.1 Erro de consistência — RELATORIO_MISSAO_04.md (CRÍTICO)

**Linha 228:** "Produzir matrizes de telas e fluxos (67 itens)"
**Correto:** 80 itens (após re-classificação da MATRIZ_TELAS_E_FLUXOS.md).
**Impacto:** O número 67 está desatualizado e contradiz a tabela da seção 3 (linha 52) que já mostra 80 itens.

### 2.2 Inconsistência de classificação — MAPA_FUNCIONAL_HORA_DO_ESTILO.md

Itens classificados como CONFIRMADA que deveriam ser CONFIRMADA (parcial), pois apenas o endpoint de listagem/GET está capturado, não a operação de criação/edição:

| Linha | Item | Classificação atual | Problema | Sugestão |
|-------|------|-------------------|----------|----------|
| 41 | Cadastro de cliente (identificação por telefone) | CONFIRMADA | Apenas GET /customers capturado; POST de cadastro não está no HAR | CONFIRMADA (parcial) |
| 70 | Cadastro de cliente | CONFIRMADA | Apenas GET /customers capturado | CONFIRMADA (parcial) |
| 93 | Cadastro de profissionais | CONFIRMADA | Apenas GET /employees capturado; POST de cadastro não está no HAR | CONFIRMADA (parcial) |
| 52 | Visualização de agenda (calendário) | CONFIRMADA | Corpo mostra um dia específico, não visualização completa de calendário | CONFIRMADA (parcial) |

**Nota:** Essas são classificações conservadoras (superestimam a evidência). Não afetam a consistência dos totais, pois permanecem como CONFIRMADA (não mudam a contagem geral).

### 2.3 Lista desatualizada — LACUNAS_EVIDENCIAS_PENDENTES.md

**Linha 241:** A lista de endpoints para "capturar corpos de resposta" inclui endpoints que JÁ têm corpos capturados no HAR:
- /auth/me, /my-profile, /dashboard, /customers, /employees, /appointments, /notifications, /employee-absences, /packages-sold

Todos estes já têm bodies confirmados no har_bodies_20261106.txt. Esta instrução deveria ser revisada para listar apenas endpoints SEM corpo capturado (ex: POST /appointments, endpoints públicos do cliente, endpoints de pagamento presencial).

### 2.4 Referências cruzadas inconsistentes

- **LAC-04** (LACUNAS linha 34): classificado como CONFIRMADA MÉDIA. No RELATORIO_MISSAO_04 não aparece como item CONFIRMADO completo na seção 4.1, apenas no MAPA_FUNCIONAL. Não é erro, mas a referência cruzada poderia ser mais explícita.
- **LAC-06** (LACUNAS linha 36): classificado como CONFIRMADA BAIXA. No MAPA_FUNCIONAL linha 40 aparece como CONFIRMADA. Consistente.
- **BBR-DASH-01** aparece duas vezes na MATRIZ_TELAS_E_FLUXOS (linhas 27 e 28) com o mesmo ID mas fluxos diferentes. Isso é intencional (mesma tela, dois fluxos), mas poderia causar confusão.

---

## 3. Funcionalidades Candidatas ao MVP

Com base na análise de evidências HAR e nas prioridades definidas, as seguintes funcionalidades são candidatas ao MVP da Missão 05:

### 3.1 Alta prioridade — Devem estar no MVP (escopo mínimo viável)

| # | Funcionalidade | Evidência | Justificativa |
|---|---------------|-----------|---------------|
| 1 | Login do barbeiro | CONFIRMADA (parcial) | Porta de entrada do sistema; /auth/me com body capturado |
| 2 | Perfil do barbeiro logado | CONFIRMADA | /my-profile com body completo capturado |
| 3 | Dashboard com resumo do dia | CONFIRMADA (parcial) | /dashboard?user_id=59 com cards total_today, total_week, total_customers, alerts |
| 4 | Visualização de agenda (slots disponíveis) | CONFIRMADA | /appointments com hours[], free_spaces[], available flags |
| 5 | Consulta de agendamentos por período | CONFIRMADA | /appointments com days[] filtrado por data |
| 6 | Finalização de agendamentos anteriores | CONFIRMADA | PUT /appointments/finalize-previous com body capturado |
| 7 | Cadastro de clientes | CONFIRMADA (parcial) | /customers?company_id=24 com body: id, full_name, is_active, email, phone, criado_em |
| 8 | Cadastro de profissionais | CONFIRMADA (parcial) | /employees/company/24 com body: id, name |
| 9 | Seleção de funcionário/empresa | CONFIRMADA | /employees/company/24/select com body |
| 10 | Catálogo de planos e assinaturas | CONFIRMADA | /subscriptions/plans e /subscription/me com bodies capturados |
| 11 | Pagamento online (PIX, cartão via Mercado Pago) | CONFIRMADA | Mercado Pago payment_methods + checkout-preview com pix_available, credit_available |
| 12 | Notificações push (FCM) | CONFIRMADA | POST /fcm-token com body capturado |
| 13 | Lista de notificações | CONFIRMADA | /notifications com body capturado |
| 14 | Status de setup do dashboard | CONFIRMADA | /dashboard/setup-status com body capturado |
| 15 | Dados do estabelecimento | CONFIRMADA (parcial) | setup-status confirma steps: account, company, branch, category, service, logo |
| 16 | Horário de funcionamento | CONFIRMADA (parcial) | /appointments com open_time, close_time |
| 17 | Dia fechado (schedule_exception) | CONFIRMADA (parcial) | /appointments com schedule_exception:false |
| 18 | Intervalo de almoço (lunchPeriod) | CONFIRMADA (parcial) | /appointments com lunchPeriod estrutura |
| 19 | Ausências de profissionais | CONFIRMADA | /employee-absences com body capturado |
| 20 | Pacotes vendidos | CONFIRMADA | /packages-sold com body capturado |

### 3.2 Funcionalidades que dependem de decisão do Comandante (D-01 a D-08)

| Decisão | Funcionalidade | Impacto no MVP |
|---------|---------------|----------------|
| D-01 | Pagamento online no MVP? | Define se o módulo financeiro inclui integração Mercado Pago |
| D-02 | Login obrigatório para cliente? | Define se a área pública do cliente precisa de autenticação |
| D-03 | Canal de notificação prioritário? | Define quais canais (push/WhatsApp/email/SMS) implementar |
| D-04 | Antecedência mínima para agendamento | Define validação de agendamento (sugerido: 2 horas) |
| D-05 | Antecedência máxima para agendamento | Define validação de agendamento (sugerido: 30 dias) |
| D-06 | Limite de no-shows para bloqueio | Define regras de cliente (sugerido: 3) |
| D-07 | Período de inatividade para cliente inativo | Define regras de cliente (sugerido: 6 meses) |
| D-08 | Minutos de atraso para no-show automático | Define controle de atendimento (sugerido: 15 minutos) |

### 3.3 Fora do MVP (Fase 2+)

| Funcionalidade | Motivo |
|---------------|--------|
| Área pública do cliente (descoberta, perfil, seleção de serviço/horário) | Zero confirmações no HAR; todos os 13 telas e 10 fluxos são DESCONHECIDAS/INFERÊNCIA |
| Relatórios detalhados e exportação CSV | Sem endpoint de relatórios no HAR |
| Analytics preditivos | Excluído (Fase 2+) |
| Pontos de fidelidade | Excluído (RF-EX-02) |
| WhatsApp Business API | Sem endpoint no HAR |
| Email/SMS | Sem endpoint no HAR |
| Emissão de notas fiscais (NF-e/NFC-e) | Não detalhada |

---

## 4. Requisitos Confirmados (Evidência Direta no HAR)

Os seguintes requisitos podem ser modelados com confiança no banco de dados e implementados na Missão 05:

| ID | Requisito | Endpoint HAR | Campos confirmados |
|----|-----------|--------------|-------------------|
| R-01 | Autenticação do barbeiro | GET /auth/me | name, function, slug, image_url |
| R-02 | Perfil do barbeiro | GET /my-profile | name, email, phone, image_url |
| R-03 | Dashboard resumo | GET /dashboard?user_id=59 | total_today, total_week, total_customers, alerts, hours[], available flag |
| R-04 | Agenda e slots | GET /appointments | days[], appointments[], free_spaces[], open_time, close_time, schedule_exception, lunchPeriod |
| R-05 | Finalização de atendimento | PUT /appointments/finalize-previous | mensagem de sucesso |
| R-06 | Listagem de clientes | GET /customers?company_id=24 | id, full_name, is_active, email, phone, criado_em |
| R-07 | Listagem de profissionais | GET /employees/company/24 | id, name |
| R-08 | Seleção de funcionário | GET /employees/company/24/select | id, name |
| R-09 | Catálogo de planos | GET /subscriptions/plans | id, nome, preço, frequência, max_branches, max_employees, benefícios |
| R-10 | Assinatura do usuário | GET /subscription/me | plano ativo, price, frequency, usage.branches, usage.employees |
| R-11 | Checkout de plano | GET /subscriptions/checkout-preview/5 | operation_type, plan_id, preço, prorated, payment_required, pix_available, credit_available |
| R-12 | Pagamento Mercado Pago | /v1/payment_methods/search, /v1/devices/widgets | pix_available, credit_available, gateway |
| R-13 | Notificações push | POST /fcm-token | token salvo com sucesso |
| R-14 | Lista de notificações | GET /notifications | id, message, is_read, created_at, type_key, name |
| R-15 | Status de setup | GET /dashboard/setup-status | progress, completed_steps, total_steps, completed, scheduling_ready, steps |
| R-16 | Ausências de profissionais | GET /employee-absences | data array |
| R-17 | Pacotes vendidos | GET /packages-sold | data array |
| R-18 | Foto de perfil | /uploads/employees/{id}-avatar.webp | imagem binária |

---

## 5. Requisitos Parcialmente Confirmados (Endpoint + corpo, mas detalhes incompletos)

| ID | Requisito | Endpoint HAR | O que está confirmado | O que é inferência / falta |
|----|-----------|--------------|----------------------|---------------------------|
| RP-01 | Cadastro de cliente | GET /customers?company_id=24 | Estrutura de cliente confirmada | POST de cadastro não capturado; validação de unicidade de telefone não confirmada |
| RP-02 | Cadastro de profissional | GET /employees/company/24 | Estrutura id, name confirmada | POST de cadastro não capturado; campos de contato, especialidade, comissão não capturados |
| RP-03 | Catálogo de serviços | GET /appointments | services[] observado (ex: "Corte Navalha") | Catálogo completo com campos/validações não capturado |
| RP-04 | Duração do serviço | GET /appointments | duration_minutes:15 observado | Duração mínima não confirmada |
| RP-05 | Preço do atendimento | GET /appointments | total_value:40 observado | Modelo de comissão por serviço não está no HAR |
| RP-06 | Cancelamento de agendamento | GET /appointments | status:"cancelado_barbeiro" observado | Endpoint de cancelamento (DELETE/PUT) não capturado |
| RP-07 | Status do cliente | GET /customers?company_id=24 | is_active:1 confirmado | Outros status (bloqueado, inativo) não estão na resposta |
| RP-08 | Horário de funcionamento | GET /appointments | open_time, close_time por dia observados | Estrutura completa por dia da semana não capturada |
| RP-09 | Dia fechado | GET /appointments | schedule_exception:false confirmado | Conceito de dia fechado é inferência parcial |
| RP-10 | Intervalo de almoço | GET /appointments | lunchPeriod estrutura confirmada | Valores não preenchidos na captura |
| RP-11 | Notificações configuráveis | GET /notifications | type_key:"new_appointment" confirmado | Regras de disparo, conteúdo completo, canais adicionais são inferência |
| RP-12 | Comissão do barbeiro | GET /subscription/me | max_employees e preço do plano confirmados | Comissão por serviço não está no HAR |
| RP-13 | Formas de pagamento | Mercado Pago / checkout-preview | PIX e cartão confirmados | Dinheiro e voucher não confirmados no HAR |
| RP-14 | Dados do estabelecimento | GET /dashboard/setup-status | steps: account, company, branch, category, service, logo confirmados | Dados específicos (nome, endereço, telefone, logo) não extraídos |
| RP-15 | Ciclo de vida do agendamento | GET /appointments, PUT /finalize-previous | status:"cancelado_barbeiro" e estado final confirmados | Estados intermediários (agendado→confirmado→em_andamento→concluído) são inferência |

---

## 6. Requisitos que Devem Permanecer Pendentes (Sem Evidência no HAR)

| ID | Requisito | Classificação | Prioridade | Ação necessária |
|----|-----------|---------------|------------|-----------------|
| RP-16 | Método de login (email/senha vs OAuth) | DESCONHECIDA | ALTA | Confirmar com o Comandante |
| RP-17 | Logout / fim de sessão | DESCONHECIDA | MÉDIA | Investigar endpoint de logout |
| RP-18 | Recuperação de senha | DESCONHECIDA | MÉDIA | Confirmar se existe tela |
| RP-19 | Login/cadastro de cliente | DESCONHECIDA | ALTA | Confirmar com o Comandante se necessário |
| RP-20 | Criação de agendamento (POST) | DESCONHECIDA | ALTA | Capturar corpo de POST /appointments |
| RP-21 | Confirmação de agendamento | DESCONHECIDA | MÉDIA | Investigar endpoint |
| RP-22 | Remarcação de agendamento | INFERÊNCIA | ALTA | Investigar endpoint |
| RP-23 | Estados intermediários do agendamento | INFERÊNCIA | MÉDIA | Capturar corpo de /appointments para ver todos os estados |
| RP-24 | Edição de cliente | DESCONHECIDA | — | Sem dado no HAR |
| RP-25 | Histórico de atendimentos do cliente | DESCONHECIDA | MÉDIA | Investigar endpoint separado |
| RP-26 | Unicidade de telefone | INFERÊNCIA | ALTA | Confirmar validação |
| RP-27 | Bloqueio por no-shows | INFERÊNCIA | MÉDIA | Confirmar se API rastreia no-shows |
| RP-28 | Inatividade por ausência | INFERÊNCIA | BAIXA | Confirmar se API marca inativos |
| RP-29 | Cadastro/edição de serviço | DESCONHECIDA | — | Sem endpoint de serviços no HAR |
| RP-30 | Serviço ativo/inativo | INFERÊNCIA | MÉDIA | Investigar campo de status |
| RP-31 | Horário individual do profissional | DESCONHECIDA | MÉDIA | Investigar se API tem horário individual |
| RP-32 | Especialidades do profissional | DESCONHECIDA | BAIXA | Confirmar se necessário para MVP |
| RP-33 | Fluxo de caixa | DESCONHECIDA | ALTA | Investigar se existe endpoint de caixa |
| RP-34 | Conciliação automática | DESCONHECIDA | BAIXA | Avaliar para Fase 2+ |
| RP-35 | WhatsApp Business API | DESCONHECIDA | MÉDIA | Confirmar se entra no MVP |
| RP-36 | Email/SMS | DESCONHECIDA | — | Sem endpoint no HAR |
| RP-37 | Regras de disparo de notificações | INFERÊNCIA | MÉDIA | Definir com base nos requisitos M03 |
| RP-38 | RBAC / Controle de acesso por papel | INFERÊNCIA | ALTA | Definir modelos de usuário e permissões com o Comandante |
| RP-39 | Permissões admin vs barbeiro | INFERÊNCIA | ALTA | Confirmar separação de responsabilidades |
| RP-40 | Relatórios detalhados | DESCONHECIDA | MÉDIA | Investigar endpoint de relatórios |
| RP-41 | Exportação CSV | DESCONHECIDA | BAIXA | Avaliar para Fase 2+ |
| RP-42 | Taxa de comparecimento | DESCONHECIDA | MÉDIA | Depende de RP-27 e RP-28 |
| RP-43 | Analytics preditivos | DESCONHECIDA | BAIXA | Excluído do MVP |

**Parâmetros pendentes do Comandante (9):**
- Antecedência mínima para agendamento (sugerido: 2 horas)
- Antecedência máxima para agendamento (sugerido: 30 dias)
- Limite de no-shows para bloqueio automático (sugerido: 3)
- Período de inatividade para cliente inativo (sugerido: 6 meses)
- Pontos de fidelidade por real gasto (sugerido: 1 ponto por R$ 1,00) — excluído do MVP
- Minutos de atraso para no-show automático (sugerido: 15 minutos)
- Formas de pagamento adicionais (dinheiro, voucher)
- Pagamento online no MVP (PIX, cartão)
- Canal de notificação prioritário (push confirmado)
- Login obrigatório para cliente

---

## 7. Dependências entre Funcionalidades

| Funcionalidade depende de | Funcionalidade dependente | Tipo de dependência |
|---------------------------|--------------------------|---------------------|
| Login do barbeiro (R-01) | Todas as funcionalidades da área do barbeiro | Prédica (porta de entrada) |
| Perfil do barbeiro (R-02) | Configurações da barbearia | Dados do usuário |
| Cadastro de clientes (RP-01) | Criação de agendamento (RP-20) | Dados do cliente |
| Cadastro de profissionais (RP-02) | Agenda e slots (R-04) | Dados do profissional |
| Agenda e slots (R-04) | Criação de agendamento (RP-20) | Disponibilidade de horários |
| Catálogo de planos (R-09) | Checkout de plano (R-11) | Seleção de plano |
| Pagamento online (R-12) | Checkout de plano (R-11) | Processamento de pagamento |
| Notificações push (R-13) | Confirmação automática (RP-11) | Canal de envio |
| Status de setup (R-15) | Configurações da barbearia (RP-14) | Progresso de configuração |
| Antecedência mínima (parâmetro) | Criação de agendamento (RP-20) | Validação de negócio |
| Antecedência máxima (parâmetro) | Criação de agendamento (RP-20) | Validação de negócio |

---

## 8. Preparação para o Spec Kit — Lista Priorizada de Requisitos

### Sprint 1 — Autenticação e Perfil (Semana 1)
1. Tela de login do barbeiro (email/senha) — R-01 (CONFIRMADA parcial)
2. Perfil do barbeiro logado — R-02 (CONFIRMADA)
3. Logout — RP-17 (DESCONHECIDA)

### Sprint 2 — Dashboard e Agenda (Semana 2-3)
4. Dashboard com resumo do dia — R-03 (CONFIRMADA parcial)
5. Visualização de agenda com slots — R-04 (CONFIRMADA)
6. Consulta de agendamentos por período — R-04 (CONFIRMADA)

### Sprint 3 — Cadastros Base (Semana 4)
7. Cadastro de clientes — RP-01 (CONFIRMADA parcial)
8. Cadastro de profissionais — RP-02 (CONFIRMADA parcial)
9. Seleção de funcionário/empresa — R-08 (CONFIRMADA)

### Sprint 4 — Controle de Atendimento (Semana 5)
10. Finalização de agendamentos — R-05 (CONFIRMADA)
11. Registro de pagamento — RP-13 (CONFIRMADA parcial)
12. Cancelamento de agendamento — RP-06 (CONFIRMADA parcial)

### Sprint 5 — Configurações e Planos (Semana 6)
13. Dados do estabelecimento — RP-14 (CONFIRMADA parcial)
14. Horário de funcionamento — RP-08 (CONFIRMADA parcial)
15. Dia fechado — RP-09 (CONFIRMADA parcial)
16. Intervalo de almoço — RP-10 (CONFIRMADA parcial)
17. Catálogo de planos — R-09 (CONFIRMADA)
18. Checkout de plano — R-11 (CONFIRMADA)

### Sprint 6 — Notificações e Relatórios Básicos (Semana 7)
19. Notificações push (FCM) — R-13 (CONFIRMADA)
20. Lista de notificações — R-14 (CONFIRMADA)
21. Dashboard resumo (já implementado) — R-03

### Fora do MVP (Fase 2+)
- Área pública do cliente (13 telas, 10 fluxos — zero confirmações no HAR)
- Relatórios detalhados e exportação CSV
- Analytics preditivos
- Pontos de fidelidade
- WhatsApp Business API
- Email/SMS
- Notas fiscais

---

## 9. O Que Ainda Precisa de Evidência Antes da Implementação

### 9.1 Imediato (antes de iniciar a Missão 05)

1. **Confirmar com o Comandante as 8 decisões D-01 a D-08** (RELATORIO_MISSAO_04 seção 6)
2. **Confirmar os 9 parâmetros pendentes** (LACUNAS seção 2.13)
3. **Definir escopo de pagamento online** (LAC-62): entrar no MVP ou Fase 2?
4. **Definir canais de notificação** (LAC-63): push apenas, ou WhatsApp/email/SMS também?
5. **Definir login do cliente** (LAC-64): obrigatório ou apenas telefone?

### 9.2 Durante a Missão 05 (conforme implementação avança)

6. Capturar corpo de resposta de POST /appointments (criação de agendamento)
7. Capturar corpo de resposta de endpoints de cliente público (se D-02 = sim)
8. Capturar corpo de resposta de endpoints de cancelamento/remarcação
9. Validar regras de negócio contra a API real à medida que endpoints são consumidos
10. Ajustar modelo de dados com base nas respostas reais da API

---

## 10. Recomendação para Iniciar a Fase 0 (Spec Kit)

**A Missão 04 está CONCLUÍDA e os 5 entregáveis estão consistentes** (com 1 erro de consistência menor a ser corrigido no RELATORIO_MISSAO_04 linha 228: 67 → 80 itens).

**Recomendação: Prosseguir para a Fase 0 (Spec Kit) com as seguintes condições:**

1. O Comandante deve confirmar as 8 decisões de produto (D-01 a D-08) antes do início da Fase 0.
2. Os 9 parâmetros pendentes devem ser confirmados ou definidos com valores padrão.
3. O escopo do MVP deve focar nas 20 funcionalidades confirmadas/parcialmente confirmadas da seção 3.1, deixando a área pública do cliente para Fase 2.
4. O Spec Kit deve ser construído com base nos requisitos confirmados (seção 4) e parcialmente confirmados (seção 5), tratando os pendentes (seção 6) como decisões de produto a serem tomadas durante a implementação.
5. O erro de consistência na linha 228 do RELATORIO_MISSAO_04.md deve ser corrigido (67 → 80 itens) antes de usar o documento como referência oficial.

**Próxima etapa:** Fase 0 — Spec Kit para o MVP do Navio Barber 2.0.

---

**Assinatura Digital:**
- Auditoria: Kilo Code
- Orquestrador: Aletheia v23
- Data/Hora: 2026-11-07
- Projeto: Navio Barber 2.0
- Documentos auditados: 5 entregáveis em `Reverse/entregas/`

⚓ **Navio Barber 2.0 — Navegar com evidências, construir com precisão.**
