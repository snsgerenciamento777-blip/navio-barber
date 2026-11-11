# INVENTARIO_TELAS_BARBEIRO.md

Inventário de Telas — Área do Barbeiro
Navio Barber 2.0 | Missão 03 — Engenharia Reversa Funcional
Data: 2026-11-06 | Status: Especificação funcional (não implementação)

---

## 1. Visão Geral

Este documento mapeia todas as telas e submenus da área do barbeiro no Navio Barber 2.0.
O conteúdo é uma especificação funcional original, desenvolvida com base nos requisitos
do módulo "Agenda Inteligente" e "Gestão de Clientes" do README do projeto.
Não é derivada de cópia de nenhum sistema concorrente ("Hora do Estilo" ou outro).

Cada tela inclui: ID, nome, propósito, sub-telas, elementos principais, ações permitidas
e telas de destino (navegação).

---

## 2. Mapa de Telas — Área do Barbeiro

### 2.1 Dashboard / Visão Geral

| Campo | Valor |
|-------|-------|
| ID | BBR-DASH-01 |
| Nome | Dashboard do Barbeiro |
| Propósito | Ponto de entrada da área do barbeiro; resumo do dia e indicadores rápidos |
| Sub-telas | Nenhuma |
| Elementos principais | • Cards de resumo: agendamentos de hoje, clientes atendidos, receita do dia, taxa de ocupação<br>• Lista de próximos atendimentos (próximas 2h)<br>• Alertas: clientes aguardando, reagendamentos pendentes, aniversariantes do dia<br>• Atalho rápido para "Novo Agendamento" |
| Ações permitidas | Visualizar resumo; abrir agendamento; iniciar atendimento; marcar como comparecido |
| Telas de destino | BBR-AGENDA-01, BBR-SERVICO-01, BBR-CLIENTE-01, BBR-CONFIG-01 |

### 2.2 Agenda (Calendário)

| Campo | Valor |
|-------|-------|
| ID | BBR-AGENDA-01 |
| Nome | Agenda de Atendimentos |
| Propósito | Visualização e gestão da agenda de horários do barbeiro |
| Sub-telas | • Visão Semana (BBR-AGENDA-02)<br>• Visão Dia (BBR-AGENDA-03)<br>• Visão Mês (BBR-AGENDA-04)<br>• Filtros e Visualizações (BBR-AGENDA-05) |
| Elementos principais | • Grade de horários por dia da semana<br>• Blocos de agendamento coloridos por status<br>• Indicador de horário atual (linha vertical "agora")<br>• Slots disponíveis vs ocupados<br>• Legenda de cores de status |
| Ações permitidas | Clicar em slot para novo agendamento; clicar em agendamento para editar; arrastar bloco para reagendar; filtrar por cliente/serviço/status |
| Telas de destino | BBR-AGENDAMENTO-01, BBR-CLIENTE-01, BBR-SERVICO-01 |

### 2.2.1 Agenda — Visão Semana

| Campo | Valor |
|-------|-------|
| ID | BBR-AGENDA-02 |
| Nome | Agenda — Visão Semanal |
| Propósito | Visualizar toda a semana de atendimentos de uma só vez |
| Elementos principais | • 7 colunas (segunda a domingo)<br>• Linhas de horário (ex: 08:00 às 20:00, intervalos de 30 min)<br>• Blocos de agendamento posicionados por horário e duração |
| Ações permitidas | Navegar semana anterior/próxima; criar agendamento em slot vazio |

### 2.2.2 Agenda — Visão Dia

| Campo | Valor |
|-------|-------|
| ID | BBR-AGENDA-03 |
| Nome | Agenda — Visão Diária |
| Propósito | Foco detalhado em um único dia de atendimentos |
| Elementos principais | • Coluna única com todos os horários do dia<br>• Lista de agendamentos do dia em ordem cronológica<br>• Indicador de almoço/pausa do barbeiro |
| Ações permitidas | Criar agendamento; editar; confirmar comparecimento; cancelar |

### 2.2.3 Agenda — Visão Mês

| Campo | Valor |
|-------|-------|
| ID | BBR-AGENDA-04 |
| Nome | Agenda — Visão Mensal |
| Propósito | Visão de longo prazo: ocupação, feriados, bloqueios |
| Elementos principais | • Grade mensal padrão<br>• Indicador de ocupação por dia (círculo colorido ou barra)<br>• Dias com bloqueio (férias, feriado, manutenção) |
| Ações permitidas | Navegar mês anterior/próximo; criar bloqueio de dia inteiro |

### 2.2.4 Agenda — Filtros e Visualizações

| Campo | Valor |
|-------|-------|
| ID | BBR-AGENDA-05 |
| Nome | Filtros da Agenda |
| Propósito | Filtrar a agenda por critérios específicos |
| Elementos principais | • Filtro por profissional (se multi-barbeiro)<br>• Filtro por serviço<br>• Filtro por status (agendado, confirmado, concluído, cancelado, ausente)<br>• Filtro por intervalo de datas<br>• Toggle: mostrar apenas horários disponíveis |
| Ações permitidas | Aplicar/remover filtros; salvar filtro como padrão |

### 2.3 Cadastro de Serviços

| Campo | Valor |
|-------|-------|
| ID | BBR-SERVICO-01 |
| Nome | Catálogo de Serviços |
| Propósito | Gerenciar os serviços oferecidos pelo barbeiro/barbearia |
| Sub-telas | • Novo Serviço (BBR-SERVICO-02)<br>• Editar Serviço (BBR-SERVICO-03)<br>• Detalhes do Serviço (BBR-SERVICO-04) |
| Elementos principais | • Lista de serviços ativos e inativos<br>• Tabela: nome, categoria, preço, duração, valor da comissão<br>• Botão "Novo Serviço"<br>• Campo de busca |
| Ações permitidas | Criar serviço; editar; ativar/inativar; visualizar detalhes; excluir (se não houver agendamentos vinculados) |
| Telas de destino | BBR-SERVICO-02, BBR-SERVICO-03, BBR-SERVICO-04 |

### 2.3.1 Serviços — Novo Serviço

| Campo | Valor |
|-------|-------|
| ID | BBR-SERVICO-02 |
| Nome | Cadastro de Novo Serviço |
| Propósito | Cadastrar um novo serviço no catálogo |
| Elementos principais | • Nome do serviço (obrigatório)<br>• Categoria (corte, barba, sobrancelha, tratamento capilar, outro)<br>• Descrição<br>• Preço (obrigatório, moeda local)<br>• Duração em minutos (obrigatório, padrão 30)<br>• Valor da comissão do barbeiro (fixo ou percentual)<br>• Ativo/Inativo (toggle, padrão ativo) |
| Ações permitidas | Salvar; cancelar; validar duplicidade de nome |

### 2.3.2 Serviços — Editar Serviço

| Campo | Valor |
|-------|-------|
| ID | BBR-SERVICO-03 |
| Nome | Edição de Serviço |
| Propósito | Alterar dados de um serviço existente |
| Elementos principais | • Mesmos campos do Novo Serviço, preenchidos com valores atuais<br>• Indicador de quantos agendamentos futuros usam este serviço |
| Ações permitidas | Salvar alterações; cancelar |

### 2.3.3 Serviços — Detalhes do Serviço

| Campo | Valor |
|-------|-------|
| ID | BBR-SERVICO-04 |
| Nome | Detalhes do Serviço |
| Propósito | Visualizar informações completas de um serviço |
| Elementos principais | • Todos os dados do serviço<br>• Histórico de alterações (quem alterou e quando)<br>• Lista de agendamentos futuros que usam este serviço |
| Ações permitidas | Editar serviço; voltar à lista |

### 2.4 Cadastro de Profissionais

| Campo | Valor |
|-------|-------|
| ID | BBR-PROFISSIONAL-01 |
| Nome | Gestão de Profissionais |
| Propósito | Cadastrar e gerenciar barbeiros da barbearia (apenas para admin/dono) |
| Sub-telas | • Novo Profissional (BBR-PROFISSIONAL-02)<br>• Editar Profissional (BBR-PROFISSIONAL-03)<br>• Detalhes do Profissional (BBR-PROFISSIONAL-04) |
| Elementos principais | • Lista de profissionais ativos e inativos<br>• Tabela: nome, contato, especialidade, status, comissão padrão<br>• Campo de busca |
| Ações permitidas | Criar profissional; editar; ativar/inativar; visualizar detalhes |
| Telas de destino | BBR-PROFISSIONAL-02, BBR-PROFISSIONAL-03, BBR-PROFISSIONAL-04 |

### 2.5 Gestão de Clientes (CRM)

| Campo | Valor |
|-------|-------|
| ID | BBR-CLIENTE-01 |
| Nome | Cadastro de Clientes |
| Propósito | Gerenciar a base de clientes do barbeiro |
| Sub-telas | • Novo Cliente (BBR-CLIENTE-02)<br>• Editar Cliente (BBR-CLIENTE-03)<br>• Perfil do Cliente (BBR-CLIENTE-04)<br>• Histórico do Cliente (BBR-CLIENTE-05) |
| Elementos principais | • Lista de clientes com busca<br>• Tabela: nome, telefone, email, último atendimento, total de visitas, pontos fidelidade<br>• Botão "Novo Cliente"<br>• Indicador de cliente novo vs recorrente |
| Ações permitidas | Criar cliente; editar; visualizar perfil; ver histórico; desativar |
| Telas de destino | BBR-CLIENTE-02, BBR-CLIENTE-03, BBR-CLIENTE-04, BBR-CLIENTE-05 |

### 2.5.1 Clientes — Novo Cliente

| Campo | Valor |
|-------|-------|
| ID | BBR-CLIENTE-02 |
| Nome | Cadastro de Novo Cliente |
| Propósito | Cadastrar um novo cliente na base |
| Elementos principais | • Nome completo (obrigatório)<br>• Telefone (obrigatório, usado para identificação e contato)<br>• Email (opcional)<br>• Data de nascimento (opcional, para lembrança de aniversário)<br>• Preferências (tipo de corte, barba, produtos)<br>• Observações (alergias, restrições, notas pessoais)<br>• Cadastro rápido vs cadastro completo |
| Ações permitidas | Salvar; cancelar; verificar se telefone já existe |

### 2.5.2 Clientes — Editar Cliente

| Campo | Valor |
|-------|-------|
| ID | BBR-CLIENTE-03 |
| Nome | Edição de Cliente |
| Propósito | Alterar dados cadastrais de um cliente |
| Elementos principais | • Mesmos campos do Novo Cliente, preenchidos<br>• Indicador de total de atendimentos realizados |
| Ações permitidas | Salvar; cancelar |

### 2.5.3 Clientes — Perfil do Cliente

| Campo | Valor |
|-------|-------|
| ID | BBR-CLIENTE-04 |
| Nome | Perfil do Cliente |
| Propósito | Visualizar informações detalhadas do cliente |
| Elementos principais | • Dados cadastrais completos<br>• Foto de perfil (opcional)<br>• Preferências de serviço<br>• Pontos de fidelidade acumulados<br>• Pacotes/assinaturas ativos |
| Ações permitidas | Editar cliente; iniciar novo agendamento para este cliente |

### 2.5.4 Clientes — Histórico do Cliente

| Campo | Valor |
|-------|-------|
| ID | BBR-CLIENTE-05 |
| Nome | Histórico de Atendimentos |
| Propósito | Ver todos os atendimentos passados do cliente |
| Elementos principais | • Lista cronológica de atendimentos<br>• Serviço realizado, profissional, data, valor pago<br>• Status (concluído, cancelado, ausente)<br>• Avaliação dada pelo cliente (se houver) |
| Ações permitidas | Visualizar detalhes de um atendimento; reagendar serviço similar |

### 2.6 Novo Agendamento

| Campo | Valor |
|-------|-------|
| ID | BBR-AGENDAMENTO-01 |
| Nome | Criar Agendamento |
| Propósito | Agendar um novo atendimento para um cliente |
| Sub-telas | • Seleção de Cliente (BBR-AGENDAMENTO-02)<br>• Seleção de Serviço (BBR-AGENDAMENTO-03)<br>• Seleção de Horário (BBR-AGENDAMENTO-04)<br>• Confirmação do Agendamento (BBR-AGENDAMENTO-05) |
| Elementos principais | • Formulário multi-etapa ou em uma única tela<br>• Resumo do agendamento em tempo real<br>• Preço total calculado automaticamente |
| Ações permitidas | Avançar etapa; voltar; cancelar agendamento; salvar |
| Telas de destino | BBR-AGENDAMENTO-02, BBR-AGENDAMENTO-03, BBR-AGENDAMENTO-04, BBR-AGENDAMENTO-05 |

### 2.6.1 Agendamento — Seleção de Cliente

| Campo | Valor |
|-------|-------|
| ID | BBR-AGENDAMENTO-02 |
| Nome | Selecionar Cliente |
| Propósito | Escolher o cliente para o agendamento |
| Elementos principais | • Busca de cliente por nome ou telefone<br>• Lista de clientes recentes<br>• Opção "Cadastrar novo cliente" (redireciona para BBR-CLIENTE-02)<br>• Seleção de cliente existente |
| Ações permitidas | Buscar; selecionar; cadastrar novo |

### 2.6.2 Agendamento — Seleção de Serviço

| Campo | Valor |
|-------|-------|
| ID | BBR-AGENDAMENTO-03 |
| Nome | Selecionar Serviço |
| Propósito | Escolher o(s) serviço(s) a serem executados |
| Elementos principais | • Lista de serviços ativos com preço e duração<br>• Opção de múltiplos serviços (agendamento combinado)<br>• Cálculo automático de duração total e preço total |
| Ações permitidas | Selecionar serviço; adicionar/remover serviço do pacote |

### 2.6.3 Agendamento — Seleção de Horário

| Campo | Valor |
|-------|-------|
| ID | BBR-AGENDAMENTO-04 |
| Nome | Selecionar Horário |
| Propósito | Escolher data e horário do atendimento |
| Elementos principais | • Calendário visual com dias disponíveis<br>• Lista de horários disponíveis para o dia selecionado<br>• Indicação de horários ocupados (por outros agendamentos)<br>• Horário de funcionamento do barbeiro<br>• Slots de folga/pausa |
| Ações permitidas | Selecionar data; selecionar horário; navegar mês anterior/próximo |

### 2.6.4 Agendamento — Confirmação

| Campo | Valor |
|-------|-------|
| ID | BBR-AGENDAMENTO-05 |
| Nome | Confirmar Agendamento |
| Propósito | Revisar e confirmar o agendamento antes de salvar |
| Elementos principais | • Resumo: cliente, serviço(s), profissional, data, horário, duração total, preço total<br>• Observações do agendamento<br>• Opção de enviar confirmação automática (WhatsApp/email/SMS)<br>• Botão "Confirmar" e "Cancelar" |
| Ações permitidas | Confirmar agendamento; voltar para editar; cancelar |

### 2.7 Minha Agenda (Agenda Pessoal do Barbeiro)

| Campo | Valor |
|-------|-------|
| ID | BBR-MINHA-AGENDA-01 |
| Nome | Minha Agenda Pessoal |
| Propósito | Visão pessoal do barbeiro: apenas seus próprios atendimentos |
| Elementos principais | • Calendário filtrado apenas pelos atendimentos do barbeiro logado<br>• Botão "Iniciar Atendimento" para o próximo cliente<br>• Indicador de cliente na cadeira (atual) |
| Ações permitidas | Iniciar atendimento; marcar como concluído; marcar como ausente |

### 2.8 Iniciar / Finalizar Atendimento

| Campo | Valor |
|-------|-------|
| ID | BBR-ATENDIMENTO-01 |
| Nome | Controle de Atendimento |
| Propósito | Gerenciar o ciclo de vida de um atendimento em andamento |
| Elementos principais | • Status atual: aguardando, em andamento, concluído, ausente<br>• Botões: "Iniciar Atendimento", "Concluir", "Marcar Ausente", "Reagendar"<br>• Campo de observações do atendimento<br>• Valor a receber (pré-preenchido do agendamento) |
| Ações permitidas | Iniciar; concluir; marcar ausente; reagendar; adicionar observação |

### 2.9 Cancelamentos e Remarcações

| Campo | Valor |
|-------|-------|
| ID | BBR-CANCELAMENTO-01 |
| Nome | Cancelar / Remarcar Agendamento |
| Propósito | Gerenciar cancelamentos e reagendamentos |
| Sub-telas | • Motivo do Cancelamento (BBR-CANCELAMENTO-02)<br>• Nova Data/Horário (BBR-CANCELAMENTO-03) |
| Elementos principais | • Lista de agendamentos futuros canceláveis<br>• Botão "Cancelar" e "Remarcar" por agendamento<br>• Informação de política de cancelamento (antecedência mínima, taxa se aplicável) |
| Ações permitidas | Cancelar com motivo; remarcar para novo horário; notificar cliente automaticamente |
| Telas de destino | BBR-CANCELAMENTO-02, BBR-CANCELAMENTO-03 |

### 2.9.1 Cancelamento — Motivo

| Campo | Valor |
|-------|-------|
| ID | BBR-CANCELAMENTO-02 |
| Nome | Motivo do Cancelamento |
| Propósito | Registrar motivo do cancelamento para análise |
| Elementos principais | • Lista de motivos predefinidos (cliente não compareceu, cliente solicitou, barbeiro indisponível, outro)<br>• Campo de observação livre |
| Ações permitidas | Selecionar motivo; adicionar observação; confirmar cancelamento |

### 2.9.2 Cancelamento — Nova Data

| Campo | Valor |
|-------|-------|
| ID | BBR-CANCELAMENTO-03 |
| Nome | Reagendar |
| Propósito | Escolher nova data e horário para o agendamento cancelado |
| Elementos principais | • Calendário com horários disponíveis<br>• Comparação: horário original vs novo horário |
| Ações permitidas | Selecionar novo horário; confirmar reagendamento |

### 2.10 Configurações e Personalização

| Campo | Valor |
|-------|-------|
| ID | BBR-CONFIG-01 |
| Nome | Configurações da Barbearia / Barbeiro |
| Propósito | Configurar dados do estabelecimento e preferências do barbeiro |
| Sub-telas | • Dados do Estabelecimento (BBR-CONFIG-02)<br>• Horário de Funcionamento (BBR-CONFIG-03)<br>• Preferências de Notificação (BBR-CONFIG-04)<br>• Meu Perfil (BBR-CONFIG-05) |
| Elementos principais | • Formulários de configuração por categoria<br>• Toggle para ativação/desativação de funcionalidades |
| Ações permitidas | Salvar configurações; redefinir para padrão |
| Telas de destino | BBR-CONFIG-02, BBR-CONFIG-03, BBR-CONFIG-04, BBR-CONFIG-05 |

### 2.10.1 Configurações — Dados do Estabelecimento

| Campo | Valor |
|-------|-------|
| ID | BBR-CONFIG-02 |
| Nome | Dados do Estabelecimento |
| Propósito | Informações da barbearia (nome, endereço, telefone, logo) |
| Elementos principais | • Nome da barbearia<br>• Endereço completo<br>• Telefone de contato<br>• Email<br>• Upload de logo/identidade visual<br>• CNPJ/CPF (para notas fiscais) |
| Ações permitidas | Salvar alterações |

### 2.10.2 Configurações — Horário de Funcionamento

| Campo | Valor |
|-------|-------|
| ID | BBR-CONFIG-03 |
| Nome | Horário de Funcionamento |
| Propósito | Definir horários de abertura e fechamento por dia da semana |
| Elementos principais | • Tabela: dia da semana, abertura, fechamento, fechado (toggle)<br>• Intervalo de almoço/pausa<br>• Horário de início e fim do expediente |
| Ações permitidas | Editar horário por dia; marcar dia como fechado; salvar |

### 2.10.3 Configurações — Preferências de Notificação

| Campo | Valor |
|-------|-------|
| ID | BBR-CONFIG-04 |
| Nome | Preferências de Notificação |
| Propósito | Configurar quais notificações são enviadas automaticamente |
| Elementos principais | • Confirmação de agendamento (WhatsApp/email/SMS)<br>• Lembrete de atendimento (X horas antes)<br>• Notificação de cancelamento<br>• Notificação de reagendamento<br>• Lembrete de aniversário do cliente |
| Ações permitidas | Ativar/desativar cada tipo; salvar |

### 2.10.4 Configurações — Meu Perfil

| Campo | Valor |
|-------|-------|
| ID | BBR-CONFIG-05 |
| Nome | Meu Perfil de Barbeiro |
| Propósito | Dados pessoais do barbeiro logado |
| Elementos principais | • Nome completo<br>• Contato (telefone, email)<br>• Foto de perfil<br>• Especialidades<br>• Bio curta (para exibição pública)<br>• Valor padrão de comissão |
| Ações permitidas | Editar; salvar; upload de foto |

### 2.11 Caixa / Financeiro (Visão do Barbeiro)

| Campo | Valor |
|-------|-------|
| ID | BBR-CAIXA-01 |
| Nome | Caixa do Barbeiro |
| Propósito | Visualizar recebíveis e comissões do barbeiro |
| Elementos principais | • Recebimentos do dia/semana/mês<br>• Comissões a receber<br>• Formas de pagamento (dinheiro, cartão, PIX, voucher)<br>• Resumo de atendimentos pagos vs pendentes |
| Ações permitidas | Marcar pagamento como recebido; exportar relatório simples |

### 2.12 Relatórios Simples (Visão do Barbeiro)

| Campo | Valor |
|-------|-------|
| ID | BBR-RELATORIO-01 |
| Nome | Relatórios Básicos |
| Propósito | Visualizar indicadores de desempenho pessoal |
| Elementos principais | • Total de atendimentos (período selecionado)<br>• Receita bruta (período)<br>• Comissões acumuladas<br>• Taxa de comparecimento (no-show rate)<br>• Clientes atendidos (únicos) |
| Ações permitidas | Selecionar período; exportar CSV |

---

## 3. Telas por Categoria

| Categoria | Telas | IDs |
|---------|-------|-----|
| Dashboard | Visão Geral | BBR-DASH-01 |
| Agenda | Agenda, Semana, Dia, Mês, Filtros | BBR-AGENDA-01 a 05 |
| Serviços | Catálogo, Novo, Editar, Detalhes | BBR-SERVICO-01 a 04 |
| Profissionais | Gestão, Novo, Editar, Detalhes | BBR-PROFISSIONAL-01 a 04 |
| Clientes | Cadastro, Novo, Editar, Perfil, Histórico | BBR-CLIENTE-01 a 05 |
| Agendamentos | Criar, Selecionar Cliente, Selecionar Serviço, Selecionar Horário, Confirmação | BBR-AGENDAMENTO-01 a 05 |
| Atendimento | Iniciar/Finalizar | BBR-ATENDIMENTO-01 |
| Cancelamentos | Cancelar/Remarcar, Motivo, Nova Data | BBR-CANCELAMENTO-01 a 03 |
| Configurações | Geral, Dados, Horário, Notificações, Perfil | BBR-CONFIG-01 a 05 |
| Caixa | Caixa do Barbeiro | BBR-CAIXA-01 |
| Relatórios | Relatórios Básicos | BBR-RELATORIO-01 |

**Total de telas mapeadas: 26**

---

## 4. Telas Não Observadas / Pendentes de Confirmação

As seguintes telas são mencionadas nos requisitos do projeto mas não têm detalhes suficientes para mapeamento completo:

- Tela de autenticação/login do barbeiro (assumida como existente, não detalhada)
- Tela de recuperação de senha
- Tela de boas-vindas/onboarding do primeiro acesso
- Tela de configuração de integração com WhatsApp Business
- Tela de emissão de notas fiscais (NF-e/NFC-e)

Estas precisam ser confirmadas pelo Comandante antes da implementação (Missão 04/05).

---

## 5. Navegação entre Telas (Resumo)

```
Dashboard (BBR-DASH-01)
  ├─ Agenda (BBR-AGENDA-01) ── Agendamento (BBR-AGENDAMENTO-01)
  ├─ Serviços (BBR-SERVICO-01)
  ├─ Clientes (BBR-CLIENTE-01) ── Perfil (BBR-CLIENTE-04)
  ├─ Minha Agenda (BBR-MINHA-AGENDA-01) ── Atendimento (BBR-ATENDIMENTO-01)
  ├─ Cancelamentos (BBR-CANCELAMENTO-01)
  ├─ Configurações (BBR-CONFIG-01)
  ├─ Caixa (BBR-CAIXA-01)
  └─ Relatórios (BBR-RELATORIO-01)
```

---

*Este documento é uma especificação funcional original. Não contém cópia de código, marca ou identidade visual de nenhum sistema de terceiros.*
