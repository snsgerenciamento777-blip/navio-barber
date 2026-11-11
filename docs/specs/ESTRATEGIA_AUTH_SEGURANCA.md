# ESTRATEGIA_AUTH_SEGURANCA.md — Estratégia de Autenticação, Autorização, Segurança e LGPD

**Versão:** 1.0  
**Data:** 2026-11-07  
**Autor:** Kilo Code (Orquestração: Aletheia v23)  
**Status:** Fase 0 — Spec Kit (especificação apenas, sem implementação)  
**Base:** ARQUITETURA_TECNICA.md, DECISOES_DO_COMANDANTE.md, REQUISITOS_FUNCIONAIS_NAO_FUNCIONAIS.md

---

## 1. Estratégia de Autenticação

### 1.1 Público-Alvo da Autenticação

| Usuário | Autentica Obrigatório? | Método | Origem da Decisão |
|---------|----------------------|--------|-------------------|
| Barbeiro | Sim | Email/telefone + senha | Evidência HAR: `GET /auth/me` |
| Cliente | Não (D-02) | Telefone apenas (sem login) | Decisão D-02 do Comandante |

### 1.2 Fluxo de Autenticação do Barbeiro

```
1. Barbeiro acessa a tela de login
2. Insere email/telefone e senha
3. Backend valida credenciais (Better Auth)
4. Se válido: gera JWT (access token + refresh token)
5. Access token expira em 24h
6. Barbeiro é redirecionado para o dashboard
7. Em requisições subsequentes: access token enviado no header Authorization
8. Se token expirado: usar refresh token para obter novo access token
```

### 1.3 Escolha do Provedor de Autenticação

| Provedor | Vantagem | Desvantagem | Custo | Recomendação |
|----------|----------|-------------|-------|--------------|
| **Better Auth** | Self-hosted, sem custo, TypeScript nativo | Requer configuração inicial | R$ 0 | ✅ Recomendado |
| Clerk | Fácil de integrar, pronto para uso | Custo após free tier, dependência externa | Free tier limitado | ❌ Dependência externa |
| Custom (próprio) | Controle total | Mais código para escrever e manter | R$ 0 | ⚠️ Alternativa |

**Decisão proposta:** Better Auth (self-hosted, R$ 0, alinhado com orçamento zero).  
**Status:** Pendente de aprovação do Comandante (AD-02).

### 1.4 Segurança da Autenticação

- **Hash de senha:** bcrypt com fator de custo 12
- **JWT access token:** Expiração de 24h, assinado com chave secreta
- **JWT refresh token:** Expiração de 30 dias, armazenado em cookie httpOnly
- **Rate limiting:** Máximo de 5 tentativas de login por minuto por IP
- **Bloqueio de conta:** Após 5 tentativas falhas consecutivas, bloquear por 15 minutos
- **HTTPS obrigatório:** Em produção, todos os endpoints de auth via HTTPS

---

## 2. Estratégia de Autorização (RBAC)

### 2.1 Modelos de Papel

O sistema adota Controle de Acesso Baseado em Papel (RBAC) com dois papéis:

| Papel | Descrição | Escopo de Acesso |
|-------|-----------|------------------|
| **barber** | Barbeiro da barbearia | Própria agenda, próprios clientes, próprios serviços |
| **admin** | Administrador da barbearia | Todas as funcionalidades + configurações + profissionais + relatórios |

### 2.2 Matriz de Permissões

| Recurso | Barber | Admin |
|---------|--------|-------|
| Dashboard próprio | ✅ | ✅ |
| Agenda própria | ✅ | ✅ |
| Agenda de outros profissionais | ❌ | ✅ |
| Cadastro de clientes | ✅ | ✅ |
| Cadastro de serviços | ✅ | ✅ |
| Cadastro de profissionais | ❌ | ✅ |
| Configurações da barbearia | ❌ (próprio perfil só) | ✅ |
| Planos e assinaturas | ❌ | ✅ |
| Relatórios | ❌ | ✅ |
| Notificações próprias | ✅ | ✅ |

### 2.3 Implementação Proposta

- **Middleware de autorização:** Verifica papel do usuário antes de permitir acesso a rotas
- **Verificação por recurso:** Para recursos próprios (ex: própria agenda), verifica se o user_id corresponde ao dono do recurso
- **Herança:** Admin herda todas as permissões do barbeiro

**Nota:** RBAC é INFERÊNCIA (não confirmado no HAR). Deve ser validado pelo Comandante antes da implementação.

---

## 3. Estratégia de Segurança

### 3.1 Segurança de Dados em Trânsito

| Item | Estratégia |
|------|-----------|
| HTTPS | Obrigatório em produção (TLS 1.3) |
| HSTS | Habilitado em produção |
| CORS | Configurado apenas para domínios autorizados |
| CSP (Content Security Policy) | Headers configurados para prevenir XSS |

### 3.2 Segurança de Dados em Repouso

| Item | Estratégia |
|------|-----------|
| Senhas | Hash bcrypt (fator 12), nunca texto puro |
| Tokens JWT | Assinados com chave secreta forte (mínimo 32 chars) |
| Dados pessoais | Campos sensíveis (telefone, email) não expostos em logs |
| Fotos de perfil | Armazenadas em bucket com controle de acesso |

### 3.3 Proteção de Endpoints

| Endpoint | Autenticação | Autorização | Rate Limiting |
|----------|-------------|-------------|---------------|
| Login | Não (público) | N/A | 5 req/min por IP |
| Dashboard | Sim | Barber/Admin | 100 req/min |
| Agenda | Sim | Barber/Admin | 100 req/min |
| Clientes | Sim | Barber/Admin | 100 req/min |
| Serviços | Sim | Barber/Admin | 100 req/min |
| Configurações | Sim | Admin apenas | 50 req/min |
| Notificações | Sim | Barber/Admin | 100 req/min |

### 3.4 Auditoria de Segurança

- **AppointmentAuditLog:** Registra toda alteração de status de agendamento (quando, quem, por quê)
- **Logs de acesso:** Registram IP, user-agent, timestamp para acessos a endpoints sensíveis
- **Logs de erro:** Não incluem dados sensíveis (senhas, tokens, dados pessoais completos)

---

## 4. Estratégia LGPD (Lei Geral de Proteção de Dados)

### 4.1 Princípios LGPD Aplicados

| Princípio LGPD | Implementação no MVP |
|---------------|---------------------|
| **Finalidade** | Dados coletados apenas para agendamento e gestão da barbearia |
| **Adequação** | Dados compatíveis com a finalidade declarada |
| **Necessidade** | Campos obrigatórios limitados ao necessário (nome, telefone para clientes) |
| **Livre acesso** | Usuário pode consultar seus dados a qualquer momento |
| **Qualidade dos dados** | Usuário pode corrigir dados incompletos ou inexatos |
| **Transparência** | Política de privacidade disponível (documento `lgpd.md`) |
| **Segurança** | Hash de senha, HTTPS, controle de acesso |
| **Prevenção** | Rate limiting, bloqueio de conta, validação de entrada |
| **Não discriminação** | Dados não usados para discriminação |
| **Responsabilização** | Trilha de auditoria (AppointmentAuditLog) |

### 4.2 Direitos do Titular (LGPD Art. 18)

| Direito | Implementação MVP | Status |
|---------|------------------|--------|
| Confirmação da existência de tratamento | Tela de perfil do cliente | Planejado |
| Acesso aos dados | Exportação de dados do cliente | Fase 2+ |
| Correção de dados incompletos | Edição de perfil do cliente | MVP |
| Anonimização/bloqueio | Desativação de cliente | MVP |
| Eliminação (direito ao esquecimento) | Exclusão de dados do cliente | MVP (soft delete) |
| Portabilidade dos dados | Exportação em formato estruturado | Fase 2+ |
| Informação sobre compartilhamento | Política de privacidade (`lgpd.md`) | Fase 2+ |
| Informação sobre não consentir | Opção de não fornecer dados opcionais | MVP |
| Revogação do consentimento | Desativação de conta | MVP |

### 4.3 Base Legal para Tratamento

| Dado | Base Legal | Justificativa |
|------|-----------|---------------|
| Nome, telefone do cliente | Execução de contrato | Necessário para agendamento |
| Email do cliente | Consentimento | Campo opcional, com opt-in |
| Data de nascimento | Consentimento | Campo opcional |
| Preferências/observações | Consentimento | Campo opcional |
| Dados do barbeiro | Execução de contrato | Necessário para operação do sistema |
| Token FCM | Consentimento | Necessário para notificações |

### 4.4 Retenção e Exclusão

| Dado | Período de Retenção | Procedimento de Exclusão |
|------|-------------------|------------------------|
| Dados do cliente | Enquanto ativo na barbearia | Soft delete (marcar como excluído) + exclusão física após 30 dias |
| Agendamentos | 5 anos (fiscal) | Arquivamento, não exclusão física |
| Tokens FCM | Enquanto dispositivo ativo | Invalidação ao logout ou desinstalação |
| Logs de auditoria | 2 anos | Rotação automática |

### 4.5 Documentação LGPD

O documento `docs/lgpd.md` deve ser criado na Fase 2+ contendo:
- Mapeamento de dados pessoais
- Base legal para cada tipo de dado
- Procedimentos de exercício de direitos do titular
- Políticas de retenção e exclusão
- Contato do encarregado (DPO)

**Status:** `lgpd.md` não existe ainda. Está planejado para Fase 2+ (RF-EX-03).

---

## 5. Riscos de Segurança e LGPD

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Vazamento de senhas | Baixa | Alto | bcrypt, HTTPS, rate limiting |
| Acesso não autorizado a dados de outro cliente | Baixa | Crítico | RBAC, verificação por resource owner |
| Falha na entrega de notificações push | Média | Médio | Log de falhas, retry, fallback documentado |
| Não conformidade LGPD | Média | Alto | `lgpd.md`, consentimento, direito ao esquecimento |
| Token FCM comprometido | Baixa | Médio | Invalidação de token, re-registro |

---

## 6. Decisões Pendentes de Aprovação

| ID | Decisão | Opções | Impacto |
|----|---------|--------|---------|
| AD-02 | Provedor de auth | Better Auth vs Clerk vs Custom | Custo, complexidade, dependência |
| AD-03 | Implementação RBAC | Middleware custom vs Biblioteca | Tempo de desenvolvimento |
| AD-04 | Soft delete vs Hard delete para LGPD | Soft delete (recomendado) vs Hard delete | Complexidade de dados |

---

⚓ **Navio Barber 2.0 — Navegar com evidências, construir com precisão.**