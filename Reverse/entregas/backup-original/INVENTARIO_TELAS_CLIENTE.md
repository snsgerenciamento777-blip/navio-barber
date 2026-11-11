# INVENTARIO_TELAS_CLIENTE.md

Inventário de Telas — Área do Cliente
Navio Barber 2.0 | Missão 03 — Engenharia Reversa Funcional
Data: 2026-11-06 | Status: Especificação funcional (não implementação)

---

## 1. Visão Geral

Este documento mapeia todas as telas e submenus da área do cliente do Navio Barber 2.0,
ou seja, o fluxo público de agendamento acessível pelo cliente (não barbeiro).
O conteúdo é uma especificação funcional original, desenvolvida com base nos requisitos
do módulo "Agenda Inteligente" do README do projeto.
Não é derivada de cópia de nenhum sistema concorrente ("Hora do Estilo" ou outro).

Cada tela inclui: ID, nome, propósito, sub-telas, elementos principais, ações permitidas
e telas de destino (navegação).

---

## 2. Mapa de Telas — Área do Cliente

### 2.1 Página Pública Inicial

| Campo | Valor |
|-------|-------|
| ID | CLI-PUBLIC-01 |
| Nome | Página Pública Inicial / Landing |
| Propósito | Ponto de entrada do cliente; busca de barbearias e profissionais disponíveis |
| Sub-telas | Nenhuma |
| Elementos principais | • Campo de busca (cidade, bairro, nome da barbearia)<br>• Lista de barbearias/profissionais mais próximos ou mais bem avaliados<br>• Categorias de serviço (corte, barba, sobrancelha, tratamento)<br>• Destaques e promoções<br>• Botão "Agendar Agora" |
| Ações permitidas | Buscar barbearia/profissional; filtrar por categoria; clicar em profissional para ver perfil |
| Telas de destino | CLI-PERFIL-01 |

### 2.2 Perfil do Profissional / Barbearia

| Campo | Valor |
|-------|-------|
| ID | CLI-PERFIL-01 |
| Nome | Perfil do Profissional ou Barbearia |
| Propósito | Exibir informações do profissional/barbearia, serviços, preços, disponibilidade e avaliações |
| Sub-telas | • Galeria de Fotos (CLI-PERFIL-02)<br>• Avaliações e Comentários (CLI-PERFIL-03) |
| Elementos principais | • Nome e foto do profissional ou fachada da barbearia<br>• Endereço e telefone<br>• Especialidades<br>• Lista de serviços com preços e durações<br>• Horário de funcionamento<br>• Avaliação média (estrelas) e número de avaliações<br>• Botão "Escolher Serviço" |
| Ações permitidas | Ver galeria; ler avaliações; selecionar serviço para agendar |
| Telas de destino | CLI-PERFIL-02, CLI-PERFIL-03, CLI-SERVICO-01 |

### 2.2.1 Perfil — Galeria de Fotos

| Campo | Valor |
|-------|-------|
| ID | CLI-PERFIL-02 |
| Nome | Galeria de Fotos |
| Propósito | Exibir fotos do trabalho do profissional ou do ambiente da barbearia |
| Elementos principais | • Grid de fotos (antes/depois de cortes, barbas, ambiente)<br>• Modal de visualização ampliada |
| Ações permitidas | Ampliar foto; navegar entre fotos |

### 2.2.2 Perfil — Avaliações e Comentários

| Campo | Valor |
|-------|-------|
| ID | CLI-PERFIL-03 |
| Nome | Avaliações e Comentários |
| Propósito | Exibir avaliações deixadas por outros clientes |
| Elementos principais | • Lista de avaliações com nota (1-5 estrelas), comentário, nome do cliente e data<br>• Filtro por nota<br>• Resumo da avaliação média |
| Ações permitidas | Ler avaliações; filtrar por nota |

### 2.3 Seleção de Serviço

| Campo | Valor |
|-------|-------|
| ID | CLI-SERVICO-01 |
| Nome | Seleção de Serviço |
| Propósito | O cliente escolhe o(s) serviço(s) que deseja agendar |
| Sub-telas | Nenhuma |
| Elementos principais | • Lista de serviços oferecidos pelo profissional/barbearia<br>• Nome, descrição, preço e duração de cada serviço<br>• Opção de selecionar múltiplos serviços (agendamento combinado)<br>• Resumo lateral: duração total e preço total atualizados em tempo real<br>• Botão "Escolher Horário" |
| Ações permitidas | Selecionar/deselecionar serviço; ver detalhes do serviço; avançar para escolha de horário |
| Telas de destino | CLI-HORARIO-01 |

### 2.4 Seleção de Horário

| Campo | Valor |
|-------|-------|
| ID | CLI-HORARIO-01 |
| Nome | Seleção de Horário |
| Propósito | O cliente escolhe a data e o horário do atendimento |
| Sub-telas | Nenhuma |
| Elementos principais | • Calendário visual com dias disponíveis (dias com slots livres destacados)<br>• Lista de horários disponíveis para o dia selecionado<br>• Indicação de horários ocupados<br>• Horário de funcionamento do profissional<br>• Botão "Próximo" |
| Ações permitidas | Selecionar data; selecionar horário; navegar mês anterior/próximo |
| Telas de destino | CLI-IDENTIFICACAO-01 |

### 2.5 Identificação do Cliente

| Campo | Valor |
|-------|-------|
| ID | CLI-IDENTIFICACAO-01 |
| Nome | Identificação do Cliente |
| Propósito | Identificar quem está fazendo o agendamento (cliente novo ou existente) |
| Sub-telas | • Cadastro Rápido (CLI-IDENTIFICACAO-02) |
| Elementos principais | • Campo de telefone (busca de cliente existente)<br>• Se telefone cadastrado: exibe dados do cliente para confirmação<br>• Se telefone não cadastrado: exibe formulário de cadastro rápido<br>• Campos: nome completo, telefone, email (opcional), data de nascimento (opcional) |
| Ações permitidas | Buscar por telefone; confirmar dados existentes; cadastrar novo cliente |
| Telas de destino | CLI-IDENTIFICACAO-02, CLI-CONFIRMACAO-01 |

### 2.5.1 Identificação — Cadastro Rápido

| Campo | Valor |
|-------|-------|
| ID | CLI-IDENTIFICACAO-02 |
| Nome | Cadastro Rápido de Cliente |
| Propósito | Cadastrar um cliente novo durante o fluxo de agendamento |
| Elementos principais | • Nome completo (obrigatório)<br>• Telefone (obrigatório)<br>• Email (opcional)<br>• Data de nascimento (opcional)<br>• Botão "Salvar e Continuar" |
| Ações permitidas | Salvar e continuar; cancelar |

### 2.6 Confirmação da Reserva

| Campo | Valor |
|-------|-------|
| ID | CLI-CONFIRMACAO-01 |
| Nome | Confirmação da Reserva |
| Propósito | O cliente revisa e confirma o agendamento antes de finalizar |
| Sub-telas | Nenhuma |
| Elementos principais | • Resumo completo: cliente, profissional, serviço(s), data, horário, duração total, preço total<br>• Forma de pagamento prevista (informativa)<br>• Termos e condições (checkbox de concordância)<br>• Opção de receber notificações (confirmação, lembrete)<br>• Botão "Confirmar Reserva" e "Voltar" |
| Ações permitidas | Confirmar reserva; voltar para editar; cancelar fluxo |
| Telas de destino | CLI-SUCESSO-01 |

### 2.7 Confirmação de Sucesso

| Campo | Valor |
|-------|-------|
| ID | CLI-SUCESSO-01 |
| Nome | Reserva Confirmada |
| Propósito | Exibir confirmação final do agendamento concluído |
| Sub-telas | Nenhuma |
| Elementos principais | • Mensagem de sucesso<br>• Resumo do agendamento (número da reserva, data, horário, profissional, serviço, preço)<br>• Código de confirmação<br>• Botões: "Adicionar à Agenda" (calendar), "Ver Meus Agendamentos", "Voltar à Página Inicial" |
| Ações permitidas | Adicionar à agenda pessoal; ver meus agendamentos; voltar ao início |

### 2.8 Meus Agendamentos

| Campo | Valor |
|-------|-------|
| ID | CLI-MEUS-AGENDAMENTOS-01 |
| Nome | Meus Agendamentos |
| Propósito | O cliente visualiza e gerencia seus próprios agendamentos |
| Sub-telas | • Detalhes do Agendamento (CLI-MEUS-AGENDAMENTOS-02)<br>• Cancelar Reserva (CLI-CANCELAR-01) |
| Elementos principais | • Lista de agendamentos futuros (próximos)<br>• Lista de agendamentos passados (histórico)<br>• Filtro por status (próximos, concluídos, cancelados)<br>• Botão "Cancelar" e "Remarcar" por agendamento futuro |
| Ações permitidas | Visualizar detalhes; cancelar; remarcar |
| Telas de destino | CLI-MEUS-AGENDAMENTOS-02, CLI-CANCELAR-01 |

### 2.8.1 Meus Agendamentos — Detalhes

| Campo | Valor |
|-------|-------|
| ID | CLI-MEUS-AGENDAMENTOS-02 |
| Nome | Detalhes do Agendamento |
| Propósito | Exibir informações completas de um agendamento específico |
| Elementos principais | • Número da reserva<br>• Cliente, profissional, serviço(s)<br>• Data, horário, duração<br>• Preço total<br>• Status (agendado, confirmado, concluído, cancelado, ausente)<br>• Forma de pagamento<br>• Observações |
| Ações permitidas | Cancelar (se futuro); remarcar (se futuro); voltar à lista |

### 2.9 Cancelar Reserva

| Campo | Valor |
|-------|-------|
| ID | CLI-CANCELAR-01 |
| Nome | Cancelar Reserva |
| Propósito | O cliente cancela um agendamento futuro |
| Sub-telas | Nenhuma |
| Elementos principais | • Confirmação de cancelamento<br>• Seleção de motivo (opcional)<br>• Informação sobre política de cancelamento (antecedência mínima, taxa se aplicável)<br>• Botão "Confirmar Cancelamento" e "Manter Reserva" |
| Ações permitidas | Confirmar cancelamento; manter reserva |
| Telas de destino | CLI-MEUS-AGENDAMENTOS-01 |

### 2.10 Remarcar Reserva

| Campo | Valor |
|-------|-------|
| ID | CLI-REMARCAR-01 |
| Nome | Remarcar Reserva |
| Propósito | O cliente altera a data e/ou horário de um agendamento futuro |
| Sub-telas | Nenhuma |
| Elementos principais | • Calendário com dias disponíveis<br>• Lista de horários disponíveis para o dia selecionado<br>• Comparação: horário original vs novo horário<br>• Botão "Confirmar Remarcação" e "Cancelar" |
| Ações permitidas | Selecionar nova data/horário; confirmar; cancelar |
| Telas de destino | CLI-MEUS-AGENDAMENTOS-01 |

### 2.11 Perfil do Cliente (Área Logada)

| Campo | Valor |
|-------|-------|
| ID | CLI-PERFIL-CLIENTE-01 |
| Nome | Meu Perfil |
| Propósito | O cliente gerencia seus dados cadastrais e preferências |
| Sub-telas | Nenhuma |
| Elementos principais | • Nome completo, telefone, email<br>• Data de nascimento<br>• Preferências de serviço<br>• Histórico de atendimentos (resumo)<br>• Pontos de fidelidade acumulados<br>• Notificações ativadas/desativadas |
| Ações permitidas | Editar dados; salvar; visualizar histórico e pontos |

---

## 3. Telas por Categoria

| Categoria | Telas | IDs |
|---------|-------|-----|
| Público | Página Inicial | CLI-PUBLIC-01 |
| Perfil Profissional | Perfil, Galeria, Avaliações | CLI-PERFIL-01 a 03 |
| Serviço | Seleção de Serviço | CLI-SERVICO-01 |
| Horário | Seleção de Horário | CLI-HORARIO-01 |
| Identificação | Identificação, Cadastro Rápido | CLI-IDENTIFICACAO-01, CLI-IDENTIFICACAO-02 |
| Confirmação | Confirmação da Reserva, Sucesso | CLI-CONFIRMACAO-01, CLI-SUCESSO-01 |
| Meus Agendamentos | Lista, Detalhes | CLI-MEUS-AGENDAMENTOS-01, CLI-MEUS-AGENDAMENTOS-02 |
| Cancelamento | Cancelar Reserva | CLI-CANCELAR-01 |
| Remarcação | Remarcar Reserva | CLI-REMARCAR-01 |
| Perfil Cliente | Meu Perfil | CLI-PERFIL-CLIENTE-01 |

**Total de telas mapeadas: 13**

---

## 4. Telas Não Observadas / Pendentes de Confirmação

As seguintes telas são mencionadas nos requisitos do projeto mas não têm detalhes suficientes:

- Tela de login/cadastro de cliente (assumida como opcional, agendamento pode ser feito sem login)
- Tela de recuperação de senha
- Tela de avaliação pós-atendimento (cliente avalia o serviço após o atendimento)
- Tela de pagamento online (integração com gateway de pagamento)
- Tela de indicação de amigos (programa de indicação premiada)
- Tela de pacotes e assinaturas

Estas precisam ser confirmadas pelo Comandante antes da implementação (Missão 04/05).

---

## 5. Navegação entre Telas (Resumo)

```
Página Inicial (CLI-PUBLIC-01)
  └─ Perfil do Profissional (CLI-PERFIL-01)
       ├─ Galeria de Fotos (CLI-PERFIL-02)
       ├─ Avaliações (CLI-PERFIL-03)
       └─ Seleção de Serviço (CLI-SERVICO-01)
            └─ Seleção de Horário (CLI-HORARIO-01)
                 └─ Identificação do Cliente (CLI-IDENTIFICACAO-01)
                      ├─ Cadastro Rápido (CLI-IDENTIFICACAO-02)
                      └─ Confirmação da Reserva (CLI-CONFIRMACAO-01)
                           └─ Reserva Confirmada (CLI-SUCESSO-01)
                                └─ Meus Agendamentos (CLI-MEUS-AGENDAMENTOS-01)
                                     ├─ Detalhes (CLI-MEUS-AGENDAMENTOS-02)
                                     ├─ Cancelar (CLI-CANCELAR-01)
                                     └─ Remarcar (CLI-REMARCAR-01)
```

---

*Este documento é uma especificação funcional original. Não contém cópia de código, marca ou identidade visual de nenhum sistema de terceiros.*
