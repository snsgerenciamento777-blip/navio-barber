# REQUISITOS_FUNCIONAIS_MVP.md

Requisitos Funcionais — MVP Navio Barber 2.0
Missão 03 — Engenharia Reversa Funcional
Data: 2026-11-06 | Status: Especificação funcional (não implementação)

---

## 1. Visão Geral

Este documento consolida os requisitos funcionais mínimos (MVP) para o Navio Barber 2.0,
organizados por domínio: barbeiro, cliente, agendamento, serviços, profissionais e
configurações. Cada requisito inclui ID, descrição, prioridade (P0 = crítico para MVP,
P1 = importante, P2 = deseável), critérios de aceitação e dependências.

Especificação funcional original, sem cópia de nenhum sistema concorrente.

---

## 2. Requisitos — Área do Barbeiro

### RF-BB-01: Dashboard do Barbeiro (P0)
**Descrição:** O barbeiro deve visualizar um dashboard com resumo do dia: agendamentos de hoje, clientes aguardando, receita prevista e taxa de ocupação.
**Critérios de aceitação:**
- Dashboard carrega em menos de 2 segundos
- Exibe pelo menos 4 cards de resumo (agendamentos hoje, clientes atendidos, receita do dia, ocupação)
- Lista próximos atendimentos (próximas 2 horas)
**Dependências:** Nenhuma (tela de entrada)

### RF-BB-02: Agenda Visual (P0)
**Descrição:** O barbeiro deve visualizar sua agenda em forma de calendário com slots de horário, diferenciando horários ocupados e disponíveis.
**Critérios de aceitação:**
- Visões: semana, dia e mês
- Blocos coloridos por status do agendamento
- Indicador de horário atual ("agora")
- Slots disponíveis clicáveis para novo agendamento
**Dependências:** RF-BB-05 (horário de funcionamento)

### RF-BB-03: Cadastro de Serviços (P0)
**Descrição:** O barbeiro deve cadastrar, editar e inativar serviços com nome, categoria, preço, duração e comissão.
**Critérios de aceitação:**
- Nome, preço e duração são obrigatórios
- Duração mínima: 15 minutos
- Serviço inativo não aparece para agendamento novo
- Histórico de agendamentos com serviço inativo é preservado
**Dependências:** Nenhuma

### RF-BB-04: Cadastro de Clientes (P0)
**Descrição:** O barbeiro deve cadastrar, editar e visualizar clientes com nome, telefone, email, data de nascimento, preferências e observações.
**Critérios de aceitação:**
- Nome e telefone são obrigatórios
- Telefone deve ser único na base
- Histórico de atendimentos do cliente é visível
- Cliente pode ser marcado como novo, ativo, inativo ou bloqueado
**Dependências:** Nenhuma

### RF-BB-05: Novo Agendamento (P0)
**Descrição:** O barbeiro deve criar um novo agendamento selecionando cliente, serviço(s), data e horário, com confirmação do resumo.
**Critérios de aceitação:**
- Fluxo multi-etapa: cliente → serviço → horário → confirmação
- Validação de horário disponível (não ocupado)
- Validação de horário dentro do expediente
- Cálculo automático de duração total e preço total
- Opção de envio de confirmação automática
**Dependências:** RF-BB-03, RF-BB-04, RF-BB-02

### RF-BB-06: Controle de Atendimento (P0)
**Descrição:** O barbeiro deve iniciar, concluir e marcar como ausente um atendimento, com registro de pagamento e observações.
**Critérios de aceitação:**
- Status do atendimento: aguardando → em andamento → concluído
- Forma de pagamento obrigatória ao concluir (dinheiro, cartão, PIX, voucher)
- Campo de observações livre
- Marcar como ausente libera o horário
**Dependências:** RF-BB-05

### RF-BB-07: Cancelamento e Remarcação (P0)
**Descrição:** O barbeiro deve cancelar ou remarcar agendamentos futuros, com registro de motivo e liberação do horário.
**Critérios de aceitação:**
- Só pode cancelar agendamentos "agendado" ou "confirmado"
- Registro de motivo do cancelamento
- Remarcação valida disponibilidade do novo horário
- Notificação automática ao cliente (se configurado)
**Dependências:** RF-BB-05

### RF-BB-08: Configurações da Barbearia (P1)
**Descrição:** O barbeiro deve configurar dados do estabelecimento, horário de funcionamento, preferências de notificação e perfil pessoal.
**Critérios de aceitação:**
- Nome, endereço, telefone, email da barbearia
- Horário de abertura/fechamento por dia da semana
- Dias marcados como fechado não geram slots
- Toggle para cada tipo de notificação automática
**Dependências:** RF-BB-02 (horário afeta agenda)

### RF-BB-09: Caixa e Comissões (P1)
**Descrição:** O barbeiro deve visualizar recebimentos do dia/semana/mês e comissões a receber.
**Critérios de aceitação:**
- Resumo de recebíveis por período
- Detalhamento por forma de pagamento
- Comissão calculada conforme configuração do serviço
**Dependências:** RF-BB-06 (pagamento registrado)

### RF-BB-10: Relatórios Simples (P2)
**Descrição:** O barbeiro deve visualizar indicadores de desempenho pessoal: total de atendimentos, receita bruta, comissões, taxa de comparecimento, clientes únicos.
**Critérios de aceitação:**
- Seleção de período (dia, semana, mês)
- Exportação para CSV
- Taxa de comparecimento (no-show rate)
**Dependências:** RF-BB-06, RF-BB-07

### RF-BB-11: Cadastro de Profissionais (P2)
**Descrição:** O admin da barbearia deve cadastrar, editar e inativar outros barbeiros da equipe.
**Critérios de aceitação:**
- Nome, contato, especialidade, comissão padrão
- Status: ativo/inativo
- Apenas visível para admin/dono da barbearia
**Dependências:** Nenhuma

---

## 3. Requisitos — Área do Cliente

### RF-CL-01: Página Pública Inicial (P0)
**Descrição:** O cliente deve acessar uma página pública para buscar barbearias e profissionais por localização ou nome.
**Critérios de aceitação:**
- Campo de busca (cidade, bairro, nome)
- Lista de profissionais/barbearias com avaliação média
- Filtro por categoria de serviço
- Botão "Agendar Agora" por profissional
**Dependências:** Nenhuma

### RF-CL-02: Perfil do Profissional (P0)
**Descrição:** O cliente deve visualizar o perfil do profissional com serviços, preços, horário de funcionamento e avaliações.
**Critérios de aceitação:**
- Nome, foto, endereço, telefone
- Lista de serviços com preços e durações
- Horário de funcionamento
- Avaliação média (estrelas) e número de avaliações
- Galeria de fotos (opcional)
**Dependências:** Nenhuma

### RF-CL-03: Seleção de Serviço (P0)
**Descrição:** O cliente deve selecionar o(s) serviço(s) desejado(s) com cálculo automático de duração e preço total.
**Critérios de aceitação:**
- Lista de serviços oferecidos pelo profissional
- Seleção de múltiplos serviços
- Resumo lateral com duração total e preço total
**Dependências:** RF-BB-03 (serviços cadastrados pelo barbeiro)

### RF-CL-04: Seleção de Horário (P0)
**Descrição:** O cliente deve escolher data e horário disponíveis para o atendimento.
**Critérios de aceitação:**
- Calendário visual com dias disponíveis
- Lista de horários livres para o dia selecionado
- Horários ocupados não são selecionáveis
- Navegação entre meses
**Dependências:** RF-BB-02, RF-BB-05

### RF-CL-05: Identificação do Cliente (P0)
**Descrição:** O cliente deve ser identificado por telefone durante o agendamento (cliente existente ou novo).
**Critérios de aceitação:**
- Busca de cliente existente por telefone
- Cadastro rápido para cliente novo (nome, telefone, email, data nascimento)
- Telefone obrigatório e único
**Dependências:** RF-BB-04

### RF-CL-06: Confirmação da Reserva (P0)
**Descrição:** O cliente deve revisar e confirmar o agendamento antes de finalizar.
**Critérios de aceitação:**
- Resumo completo: cliente, profissional, serviço(s), data, horário, duração, preço total
- Aceitação de termos e condições (checkbox)
- Opção de notificações (confirmação, lembrete)
- Geração de código de confirmação
**Dependências:** RF-CL-03, RF-CL-04, RF-CL-05

### RF-CL-07: Meus Agendamentos (P0)
**Descrição:** O cliente deve visualizar seus agendamentos futuros e passados, com opção de cancelar ou remarcar.
**Critérios de aceitação:**
- Lista de agendamentos futuros e histórico
- Filtro por status
- Detalhes de cada agendamento
- Botões de cancelar e remarcar (para agendamentos futuros)
**Dependências:** RF-CL-06

### RF-CL-08: Cancelamento de Reserva (P0)
**Descrição:** O cliente deve cancelar um agendamento futuro com registro de motivo opcional.
**Critérios de aceitação:**
- Só pode cancelar agendamentos "agendado" ou "confirmado"
- Registro de motivo (opcional)
- Liberação do horário para outros clientes
- Notificação ao profissional (se configurado)
**Dependências:** RF-CL-07

### RF-CL-09: Remarcação de Reserva (P0)
**Descrição:** O cliente deve remarcar um agendamento futuro para nova data e/ou horário.
**Critérios de aceitação:**
- Validação de disponibilidade do novo horário
- Validação dentro do horário de funcionamento
- Notificação ao profissional
**Dependências:** RF-CL-07

### RF-CL-10: Perfil do Cliente (P1)
**Descrição:** O cliente deve editar seus dados cadastrais e visualizar pontos de fidelidade e histórico resumido.
**Critérios de aceitação:**
- Edição de nome, email, data nascimento, preferências
- Visualização de pontos de fidelidade
- Visualização de histórico resumido de atendimentos
**Dependências:** RF-BB-04, RF-CL-05

---

## 4. Requisitos — Transversais

### RF-TR-01: Autenticação do Barbeiro (P0)
**Descrição:** O barbeiro deve fazer login para acessar a área restrita da barbearia.
**Critérios de aceitação:**
- Login com email/telefone e senha
- Recuperação de senha (pendente de confirmação)
- Sessão persistente enquanto não houver logout
**Dependências:** Nenhuma (pré-requisito de todas as telas do barbeiro)

### RF-TR-02: Notificações Automáticas (P1)
**Descrição:** O sistema deve enviar notificações automáticas (WhatsApp/email/SMS) para confirmação de agendamento, lembrete, cancelamento e reagendamento.
**Critérios de aceitação:**
- Configurável por tipo de notificação
- Envio após criação de agendamento (confirmação)
- Envio X horas antes do atendimento (lembrete, padrão 24h)
- Envio após cancelamento/reagendamento
**Dependências:** RF-BB-05, RF-CL-06, RF-BB-07, RF-CL-08, RF-CL-09

### RF-TR-03: Controle de Acesso por Papel (P1)
**Descrição:** O sistema deve diferenciar permissões entre barbeiro e admin/dono da barbearia.
**Critérios de aceitação:**
- Barbeiro: acessa sua própria agenda, clientes, atendimentos
- Admin: acessa configurações, cadastro de profissionais, relatórios consolidados
**Dependências:** RF-TR-01

### RF-TR-04: Persistência de Dados (P0)
**Descrição:** Todos os dados (agendamentos, clientes, serviços, pagamentos) devem ser persistidos em banco de dados.
**Critérios de aceitação:**
- Dados sobrevivem a reinicialização do sistema
- Backup automático diário (configurável)
**Dependências:** Nenhuma (pré-requisito de todos os requisitos)

---

## 5. Requisitos Não Funcionais (MVP)

| ID | Descrição | Critério de Aceitação |
|----|-----------|----------------------|
| RNF-01 | Performance | Telas carregam em menos de 2 segundos em conexão 3G |
| RNF-02 | Disponibilidade | Sistema disponível 99% do tempo durante horário de funcionamento |
| RNF-03 | Segurança | Senhas hashadas; dados pessoais criptografados em repouso |
| RNF-04 | Responsividade | Interface funciona em mobile e desktop |
| RNF-05 | LGPD | Consentimento para coleta de dados; direito ao esquecimento |

---

## 6. Requisitos Excluídos do MVP (Fase 2+)

Os seguintes requisitos estão nos requisitos do projeto completo mas estão **fora do escopo do MVP**:

| ID | Descrição | Motivo da Exclusão |
|----|-----------|-------------------|
| RF-EX-01 | Marketing automatizado (campanhas de reativação, aniversariantes) | Fase 2 |
| RF-EX-02 | Fidelidade com pontos e pacotes | Fase 2 |
| RF-EX-03 | Financeiro completo (fluxo de caixa, NF-e, comissões avançadas) | Fase 2 (versão simples no MVP) |
| RF-EX-04 | Analytics e BI dashboard | Fase 2 |
| RF-EX-05 | Multi-unidade (franquias/redes) | Fase 3 |
| RF-EX-06 | App mobile nativo (React Native) | Fase 2 (PWA na web) |
| RF-EX-07 | Pagamento online integrado | Fase 2 (pagamento presencial no MVP) |
| RF-EX-08 | WhatsApp Business API integration | Fase 2 (notificações simples no MVP) |
| RF-EX-09 | PDV offline-first | Fase 4 |
| RF-EX-10 | Marketplace de profissionais | Fase 3 |

---

## 7. Matriz de Rastreabilidade

| Requisito | Tela(s) Associada(s) | Fluxo(s) Associado(s) | Regra de Negócio |
|-----------|---------------------|----------------------|------------------|
| RF-BB-01 | BBR-DASH-01 | Fluxo: Início do Expediente | Nenhuma |
| RF-BB-02 | BBR-AGENDA-01 a 05 | Fluxo: Início do Expediente | RG-AG-01 a 07 |
| RF-BB-03 | BBR-SERVICO-01 a 04 | Fluxo: Cadastro de Novo Serviço | RG-SV-01 a 03 |
| RF-BB-04 | BBR-CLIENTE-01 a 05 | Fluxo: Cadastro de Novo Cliente | RG-CL-01 a 06 |
| RF-BB-05 | BBR-AGENDAMENTO-01 a 05 | Fluxo: Novo Agendamento | RG-AG-01 a 09 |
| RF-BB-06 | BBR-ATENDIMENTO-01 | Fluxo: Início/Finalização de Atendimento | RG-AT-01 a 06 |
| RF-BB-07 | BBR-CANCELAMENTO-01 a 03 | Fluxo: Cancelamento/Remarcação | RG-CX-01 a 03 |
| RF-BB-08 | BBR-CONFIG-01 a 05 | Fluxo: Gestão de Configurações | RG-CF-01 a 03 |
| RF-CL-01 | CLI-PUBLIC-01 | Fluxo: Descoberta e Escolha | Nenhuma |
| RF-CL-02 | CLI-PERFIL-01 a 03 | Fluxo: Descoberta e Escolha | Nenhuma |
| RF-CL-03 | CLI-SERVICO-01 | Fluxo: Seleção de Serviços | RG-AG-04, RG-AG-05 |
| RF-CL-04 | CLI-HORARIO-01 | Fluxo: Seleção de Data e Horário | RG-AG-01, RG-AG-02, RG-AG-06, RG-AG-07 |
| RF-CL-05 | CLI-IDENTIFICACAO-01, 02 | Fluxo: Identificação do Cliente | RG-CL-01 |
| RF-CL-06 | CLI-CONFIRMACAO-01 | Fluxo: Confirmação da Reserva | Nenhuma |
| RF-CL-07 | CLI-MEUS-AGENDAMENTOS-01, 02 | Fluxo: Visualização de Meus Agendamentos | Nenhuma |
| RF-CL-08 | CLI-CANCELAR-01 | Fluxo: Cancelamento de Reserva | RG-CX-01 a 03 |
| RF-CL-09 | CLI-REMARCAR-01 | Fluxo: Remarcação de Reserva | RG-CX-01 a 03 |

---

## 8. Requisitos Pendentes de Confirmação

Os seguintes requisitos precisam de confirmação do Comandante antes da implementação:

| ID | Requisito | Pergunta para o Comandante |
|----|-----------|---------------------------|
| RF-PD-01 | Autenticação | O agendamento do cliente deve exigir login ou pode ser feito apenas por telefone? |
| RF-PD-02 | Pagamento online | O MVP deve incluir pagamento online ou apenas pagamento presencial? |
| RF-PD-03 | Notificações | Qual canal de notificação prioritário: WhatsApp, email ou SMS? |
| RF-PD-04 | Antecedência | Qual o valor exato de antecedência mínima/máxima para agendamento? |
| RF-PD-05 | No-show | Quantos no-shows bloqueiam um cliente automaticamente? |
| RF-PD-06 | Avaliação | O cliente deve avaliar o serviço após o atendimento no MVP? |

---

## 9. Estimativa de Complexidade do MVP

| Domínio | Requisitos P0 | Requisitos P1 | Requisitos P2 | Complexidade Relativa |
|---------|--------------|---------------|---------------|----------------------|
| Barbeiro | 7 | 3 | 1 | Alta |
| Cliente | 6 | 1 | 0 | Média |
| Transversais | 2 | 2 | 0 | Média |
| **Total** | **15** | **6** | **1** | — |

**Foco do MVP:** 15 requisitos P0 (críticos) devem ser implementados primeiro, cobrindo o fluxo completo de agendamento tanto para barbeiro quanto para cliente.

---

*Este documento é uma especificação funcional original. Não contém cópia de código, marca ou identidade visual de nenhum sistema de terceiros.*
