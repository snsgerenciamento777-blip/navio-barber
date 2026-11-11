# ESTRATEGIA_NOTIFICACOES_TRANSACIONAL.md — Estratégia de Notificações Push e Transacional no-show

**Versão:** 1.0  
**Data:** 2026-11-07  
**Autor:** Kilo Code (Orquestração: Aletheia v23)  
**Status:** Fase 0 — Spec Kit (especificação apenas, sem implementação)  
**Base:** DECISOES_DO_COMANDANTE.md (D-03, D-08), REQUISITOS_FUNCIONAIS_NAO_FUNCIONAIS.md, REGRAS_NEGOCIO_APROVADAS.md

---

## 1. Estratégia de Notificações Push (FCM)

### 1.1 Canal de Notificação

**Canal aprovado:** Push (Firebase Cloud Messaging — FCM)  
**Decisão vinculante:** D-03 — Push (FCM) será o canal prioritário de notificações.  
**Evidência:** `POST /fcm-token` (corpo capturado no HAR); `GET /notifications` (corpo capturado)  
**Custo:** R$ 0 (Firebase Free Tier para volumes iniciais)

### 1.2 Clientes com Diferentes Estados de Dispositivo

A especificação deve diferenciar quatro estados de cliente quanto à recepção de push:

| Estado | Descrição | Recebe Push? | Ação do Sistema |
|--------|-----------|--------------|-----------------|
| **Cliente com app + permissão** | Aplicativo instalado e usuário concedeu permissão de notificações | ✅ Sim | Enviar push normalmente via FCM |
| **Cliente sem app instalado** | Não tem o aplicativo Navio Barber instalado no dispositivo | ❌ Não | Notificar como limitação; alternativa fora do escopo sem custo adicional |
| **Cliente negou permissão** | App instalado, mas usuário negou permissão de notificações | ❌ Não | Exibir aviso no app solicitando permissão; não enviar push |
| **Token inválido/entrega malsucedida** | Token FCM expirado, revogado ou Firebase retornou erro de entrega | ❌ Não | Marcar token como inativo; tentar re-registro na próxima abertura do app |

**Regra obrigatória:** Não presumir que um cliente que agenda pelo navegador possui o aplicativo instalado ou recebe notificações FCM.

### 1.3 Eventos que Geram Notificações

| Evento | Destinatário | Tipo (type_key) | Gatilho |
|--------|-------------|-----------------|---------|
| Novo agendamento | Barbeiro + Cliente | `new_appointment` | Agendamento criado com sucesso |
| Cancelamento de agendamento | Barbeiro + Cliente | `appointment_cancelled` | Agendamento cancelado |
| Remarcação de agendamento | Barbeiro + Cliente | `appointment_rescheduled` | Agendamento remarcado |
| Lembrete de agendamento | Cliente | `appointment_reminder` | 24h antes do agendamento (configurável) |
| No-show automático | Barbeiro | `appointment_no_show` | Rotina de no-show encerra agendamento |

### 1.4 Fluxo de Registro de Token FCM

```
1. Usuário abre o aplicativo (web/PWA)
2. Solicita permissão de notificações (se ainda não concedida)
3. Se concedido: Firebase gera token FCM
4. Frontend envia token para backend via POST /fcm-token
5. Backend armazena token vinculado ao user_id
6. Token é usado para enviar notificações push
```

### 1.5 Tratamento de Falhas de Entrega

| Falha | Ação |
|-------|------|
| Token inválido (404 da FCM) | Marcar token como inativo no banco; não tentar novamente |
| Dispositivo offline | FCM retém mensagem e entrega quando dispositivo ficar online |
| Erro de quota FCM | Registrar erro; tentar novamente em ciclo posterior |
| Cliente sem app instalado | Não tentar enviar; documentar como limitação |

### 1.6 Preferências e Desativação

- O usuário pode desativar notificações por tipo (toggle nas configurações)
- Desativação global de notificações disponível
- Preferências armazenadas no banco vinculadas ao user_id

### 1.7 Limitação Documentada (Obrigatório)

**Para o MVP, clientes que se enquadram nos estados 2, 3 ou 4 acima não recebem notificações push.** Esta é uma limitação conhecida e documentada, não uma funcionalidade existente. A alternativa (WhatsApp, email, SMS) está fora do escopo inicial por exigir integrações pagas e não ter evidência no HAR.

---

## 2. Estratégia Transacional — No-Show Automático

### 2.1 Visão Geral

A regra de 15 minutos (D-08) não pode simplesmente liberar um horário sem verificar o estado atual do agendamento. A rotina de no-show deve ser transacionalmente segura.

### 2.2 Requisitos Obrigatórios da Rotina de No-Show

Todos os seguintes requisitos são OBRIGATÓRIOS para a especificação da rotina de no-show:

| ID | Requisito | Descrição |
|----|-----------|-----------|
| NS-01 | Verificação de estado | Verificar o agendamento imediatamente antes da alteração |
| NS-02 | Confirmação de validade | Confirmar que o agendamento ainda está válido (não cancelado, concluído ou remarcado) |
| NS-03 | Operação atômica | Operação atômica ou mecanismo equivalente para impedir alterações concorrentes |
| NS-04 | Idempotência | Executar repetidamente não gera faltas duplicadas |
| NS-05 | Não sobrescrever alteração recente | Impedir que a rotina sobrescreva uma alteração mais recente |
| NS-06 | Registro de auditoria | Registrar data, horário, motivo e origem da alteração |
| NS-07 | Trilha de auditoria | Manter registro imutável de todas as alterações de no-show |
| NS-08 | Intervenção manual | Permitir que o barbeiro desfaça ou modifique um no-show automático |
| NS-09 | Resiliência | Definir comportamento para atraso de processamento ou indisponibilidade do sistema |

### 2.3 Fluxo da Rotina de No-Show (Especificação)

```
1. Rotina é disparada (agendada ou por evento)
2. Seleciona agendamentos candidatos:
   - Status = "pending" OU "confirmed"
   - start_at < now - 15 minutos (atraso de 15 min)
   - Não possui registro de no-show recente (idempotência)
3. Para cada agendamento candidato:
   a. INICIAR TRANSAÇÃO
   b. RE-ler o agendamento com bloqueio (SELECT ... FOR UPDATE)
   c. Verificar: status ainda é "pending" ou "confirmed"? (NS-01, NS-02)
   d. Verificar: não foi alterado após start_at? (NS-05)
   e. Se válido: alterar status para "no_show"
   f. Criar registro em AppointmentAuditLog (NS-06, NS-07)
   g. Liberar o slot (marcar como disponível)
   h. COMMIT TRANSAÇÃO
   i. Se inválido (cancelado/concluído/remarcado): ROLLBACK, não alterar nada
4. Registrar resultado da execução (sucessos, falhas, ignorados)
```

### 2.4 Mecanismos de Proteção Transacional

#### 2.4.1 Bloqueio de Linha (Row-Level Locking)

Usar `SELECT ... FOR UPDATE` no PostgreSQL para bloquear a linha do agendamento durante a transação, impedindo que outra transação modifique o mesmo agendamento simultaneamente.

#### 2.4.2 Versionamento Otimista (Alternativa)

Adicionar campo `version` (integer) à tabela de agendamentos. Cada atualização incrementa a versão. A rotina de no-show só atualiza se a versão corresponder ao valor lido inicialmente.

#### 2.4.3 Idempotência via Chave de Idempotência

Gerar uma chave de idempotência baseada em `(appointment_id, scheduled_check_time)`. Antes de processar, verificar se já existe processamento para essa chave. Se existir, pular.

#### 2.4.4 Registro de Auditoria Imutável

Cada alteração de no-show cria um registro em `AppointmentAuditLog` com:
- `appointment_id`
- `old_status` (status antes da alteração)
- `new_status` = "no_show"
- `reason` = "no_show_automatico_15min"
- `source` = "system"
- `changed_by` = null (sistema) ou user_id (manual)
- `changed_at` = timestamp

### 2.5 Comportamento em Casos de Borda

| Cenário | Comportamento |
|---------|--------------|
| Agendamento já cancelado | Não alterar; pular (NS-02) |
| Agendamento já concluído | Não alterar; pular (NS-02) |
| Agendamento já remarcado | Não alterar; pular (NS-02, NS-05) |
| Duas rotinas executando simultaneamente | Apenas uma altera; a outra encontra status já alterado e pula (NS-03) |
| Rotina executada duas vezes para mesmo agendamento | Segunda execução não cria no-show duplicado (NS-04) |
| Sistema indisponível durante execução | Transação falha e faz rollback; tentar novamente em ciclo posterior (NS-09) |
| Barbeiro modifica agendamento após no-show automático | Permitido se slot ainda livre (NS-08) |

### 2.6 Critérios de Aceitação da Rotina de No-Show

- [ ] A rotina verifica o estado do agendamento imediatamente antes de alterar
- [ ] A rotina não altera agendamentos cancelados, concluídos ou remarcados
- [ ] Execuções concorrentes resultam em apenas uma alteração efetiva
- [ ] Execução repetida não cria registros de no-show duplicados
- [ ] Cada no-show gera registro em AppointmentAuditLog com motivo e origem
- [ ] O barbeiro pode desfazer um no-show automático se o slot ainda estiver livre
- [ ] Falhas de processamento são registradas e retry é tentado
- [ ] Não há agendamentos deixados em estado indefinido após falha

---

## 3. Matriz de Decisões — Notificações e No-Show

| Decisão | Valor | Funcionalidades Afetadas |
|---------|-------|------------------------|
| D-03 | Push (FCM) apenas | RF-TR-02, RG-NT-01 a RG-NT-04 |
| D-08 | No-show após 15 minutos | RF-BB-04, RF-BB-06, RG-NS-01 a RG-NS-09 |
| Limitação push | Clientes sem app/permissão não recebem | RF-TR-02 (documentado como limitação) |

---

## 4. Riscos e Pendências

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Cliente sem app não recebe push | Alta | Médio | Documentar como limitação; alternativas em Fase 2+ |
| Token FCM expirado | Média | Baixo | Re-registro na próxima abertura do app |
| Race condition na rotina de no-show | Baixa | Médio | SELECT FOR UPDATE + versionamento |
| No-show falso positivo (cliente atrasado mas a caminho) | Média | Médio | Intervenção manual do barbeiro (NS-08) |
| Falha de processamento da rotina | Baixa | Médio | Log de falhas + retry automático |

---

## 5. Pendentes de Implementação (Não Fazer Nesta Missão)

- [ ] Implementar rotina de no-show (especificação apenas nesta missão)
- [ ] Implementar envio de push via FCM (especificação apenas nesta missão)
- [ ] Implementar registro de token FCM (especificação apenas nesta missão)

---

⚓ **Navio Barber 2.0 — Navegar com evidências, construir com precisão.**