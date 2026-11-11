# Navio Barber 2.0

> **Sistema de Gestão para Barbearias Modernas** — Uma plataforma completa para agendamento, gestão de clientes, controle financeiro e automação de marketing para barbearias.

---

## 🎯 Visão Geral

O **Navio Barber 2.0** é a evolução da plataforma de gestão para barbearias, construída com arquitetura moderna, stack tecnológica robusta e foco em experiência do usuário excepcional. O projeto nasce da necessidade de barbearias profissionais terem uma ferramenta que una simplicidade operacional com poder analítico.

### O que o Navio Barber 2.0 resolve

| Problema Tradicional | Solução Navio Barber 2.0 |
|---|---|
| Agendamentos por WhatsApp/ligação perdida | Agendamento online 24/7 com confirmação automática |
| Controle de caixa em caderno/planilha | Dashboard financeiro em tempo real |
| Fidelização baseada em "memória" | Sistema de pontos, pacotes e recorrência automatizado |
| Marketing manual e inconsistente | Campanhas segmentadas por comportamento do cliente |
| Sem visão de performance do negócio | Analytics preditivos e KPIs acionáveis |

---

## 🏗️ Arquitetura da Tripulação (Multi-Agent Orchestration)

O desenvolvimento do Navio Barber 2.0 utiliza uma **arquitetura de orquestração multi-agente** via **Aletheia v23**, permitindo desenvolvimento paralelo, revisão de código distribuída e integração contínua inteligente.

### Hierarquia de Comando

```
┌─────────────────────────────────────────────────────────────────┐
│  COMANDANTE: CLAUDE CODE (Opus 5.5)                             │
│  Orquestração suprema, decisões arquiteturais, code sovereignty │
└────────────────────────────────────┬────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  ORQUESTRADOR: ALETHEIA v23                                     │
│  Planejamento, delegação, budget, quota, worktrees, relatórios  │
└────────────────────────────────────┬────────────────────────────┘
                                     ▼
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│ EQUIPE CLAUDE │            │ EQUIPE COPILOT│            │ 9ROUTER GATEWAY│
│ (Subscription)│            │(AI Credits)   │            │ (Roteamento)  │
├───────────────┤            ├───────────────┤            ├───────────────┤
│ Opus: Arquit. │            │ GPT-5.5: Arch │            │ Modelos: Todos │
│ Sonnet: Impl. │            │ GPT-5: Impl.  │            │ Roteia custo/  │
│ Haiku: Review │            │ Fleet: Paral. │            │ capacidade     │
│ Fable: Análise│            │ Sessões isol. │            │ BYOK: Anthr/   │
│ Worktrees     │            │ Agents custom │            │ OpenAI/Azure   │
└───────────────┘            └───────────────┘            └───────────────┘
        │                            │                            │
        └────────────────────────────┼────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  CONTEXTO COMPARTILHADO (Aletheia)                              │
│  • Handoff.md por worker   • State.json + Journal.jsonl         │
│  • Diff.patch + Outcome.json • AGENTS.md / CLAUDE.md unificados │
│  • Budget tracking           • Quota monitoring                 │
└─────────────────────────────────────────────────────────────────┘
```

### Agentes Operacionais Disponíveis

| Agente | Modelo Principal | Função | Status |
|---|---|---|---|
| **Claude Code** | Opus 5.5 / Sonnet 5.5 | Arquiteto, Implementação, Integração Final | ✅ Operacional |
| **GitHub Copilot CLI** | GPT-5.5 / GPT-5 (BYOK) | Implementação Paralela, Fleet Mode | ✅ Operacional |
| **Agy / Antigravity** | Gemini (req. API Key) | Worker Secundário | ⚠️ Parcial |
| **9Router** | Gateway Multi-Modelo | Roteamento Inteligente | ✅ Rodando* |

> * **⚠️ Ação Crítica Pendente**: 9Router exposto em `0.0.0.0:20128` (HTTP plaintext). Requer `--host 127.0.0.1` + TLS para acesso remoto seguro.

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: React 18+ / Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Estado**: Zustand / TanStack Query
- **Formulários**: React Hook Form + Zod
- **Charts**: Recharts / Tremor

### Backend
- **Runtime**: Node.js 20+ / Bun
- **API**: tRPC / Hono (Edge-ready)
- **Database**: PostgreSQL 16 + Prisma ORM
- **Auth**: Better Auth / Clerk
- **Realtime**: Socket.io / Pusher
- **Jobs**: BullMQ + Redis

### Infraestrutura
- **Deploy**: Vercel (Frontend) + Railway/Render (Backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + PostHog
- **Storage**: Supabase Storage / S3

### Ferramentas de Desenvolvimento
- **Editor**: VS Code com extensões da tripulação
- **Agentes CLI**: Claude Code, Copilot CLI, OpenCode
- **Orquestração**: Aletheia v23
- **Gateway**: 9Router (model routing)
- **MCP Servers**: Playwright, Context7, Web Lens

---

## 📦 Módulos Principais

### 1. **Agenda Inteligente** 📅
- Agendamento online com disponibilidade em tempo real
- Gestão de profissionais, serviços e recursos (cadeiras, salas)
- Confirmação automática via WhatsApp/E-mail/SMS
- Lista de espera inteligente com notificação de vaga
- Bloqueios de agenda (férias, manutenção, eventos)

### 2. **Gestão de Clientes (CRM)** 👥
- Perfil 360°: histórico, preferências, aniversários, alergias
- Segmentação automática (RFM, LTV, frequência)
- Programa de fidelidade: pontos, cashback, indicações
- Pacotes e assinaturas recorrentes (mensalidades)
- Comunicação omnicanal integrada

### 3. **Financeiro & Caixa** 💰
- Fluxo de caixa diário/mensal com conciliação automática
- Múltiplas formas de pagamento (PIX, cartão, dinheiro, voucher)
- Comissionamento flexível por profissional/serviço
- Emissão de NF-e / NFC-e integrada
- Relatórios gerenciais (DRE, ticket médio, ocupação)

### 4. **Marketing Automatizado** 📈
- Campanhas de reativação (clientes inativos 30/60/90 dias)
- Aniversariantes do mês com oferta personalizada
- Indicação premiada (tracking viral)
- WhatsApp Business API (templates aprovados)
- Landing pages por campanha com tracking UTM

### 5. **Analytics & BI** 📊
- Dashboard executivo em tempo real
- KPIs: Ocupação, Ticket Médio, LTV, Churn, NPS
- Previsão de demanda (ML simples)
- Comparativo YoY / MoM
- Exportação para Excel/PDF agendada

### 6. **Multi-unidade (Franquias/Redes)** 🏢
- Gestão centralizada com autonomia local
- Consolidação financeira automática
- Catálogo de serviços unificado com preços regionais
- Transferência de clientes entre unidades
- Permissões baseadas em papel (RBAC)

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 20+ / Bun 1.1+
- PostgreSQL 16+
- Redis 7+
- Conta GitHub (para Copilot CLI)
- Assinatura Anthropic (para Claude Code)

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-org/navio-barber-2.0.git
cd navio-barber-2.0

# Instale dependências
bun install  # ou npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Suba o banco de dados
docker compose up -d postgres redis

# Rode migrações
bun prisma migrate dev

# Inicie desenvolvimento
bun dev
```

### Configuração dos Agentes (Opcional - Para Desenvolvimento Acelerado)

```bash
# Claude Code (já configurado via OAuth)
claude --version

# GitHub Copilot CLI
npm i -g @github/copilot-cli
copilot auth login

# Aletheia Orchestration
cd .agents/skills/alethe
py scripts/orchestrate.py doctor
py scripts/orchestrate.py playbook --init

# 9Router Gateway (após fix de segurança)
9router --host 127.0.0.1 --port 20128
```

---

## 📁 Estrutura do Projeto

```
navio-barber-2.0/
├── .agents/                    # Configuração da tripulação multi-agente
│   └── skills/alethe/         # Aletheia v23 orchestration
├── apps/
│   ├── web/                   # Frontend Next.js (barbearia + admin)
│   ├── api/                   # Backend tRPC/Hono
│   └── mobile/                # React Native (futuro)
├── packages/
│   ├── ui/                    # Design system compartilhado
│   ├── database/              # Prisma schema + migrations
│   ├── auth/                  # Better Auth config
│   ├── utils/                 # Helpers compartilhados
│   └── config/                # ESLint, TSConfig, Tailwind presets
├── tools/
│   ├── scripts/               # Scripts de automação
│   └── generators/            # Code generators (Scaffolding)
├── docs/                      # Documentação técnica
├── .github/
│   ├── workflows/             # CI/CD pipelines
│   └── agents/                # Custom Copilot agents
├── docker-compose.yml
├── turbo.json                 # Turborepo config
├── package.json
└── README.md
```

---

## 🔐 Segurança & Compliance

- **LGPD/GDPR Ready**: Consentimento granular, direito ao esquecimento, portabilidade
- **PCI DSS**: Integração com gateways certificados (Mercado Pago, Stripe, Asaas)
- **Criptografia**: TLS 1.3 em trânsito, AES-256 em repouso
- **Auditoria**: Logs imutáveis de ações sensíveis (LGPD Art. 37)
- **Backup**: Automático diário + point-in-time recovery (RPO < 1h, RTO < 4h)

---

## 🧪 Qualidade & Testes

| Camada | Ferramenta | Cobertura Alvo |
|---|---|---|
| Unit | Vitest + React Testing Library | ≥ 80% |
| Integration | Vitest + Testcontainers | ≥ 70% |
| E2E | Playwright MCP | Critical paths 100% |
| Contract | Pact / tRPC | All public procedures |
| Visual | Playwright + Chromatic | Design system components |
| Performance | k6 / Lighthouse CI | p95 < 200ms API, < 2.5s TTI |

---

## 📋 Roadmap

### Fase 1 — MVP Core (Q1 2027) ✅ *Em andamento*
- [x] Arquitetura multi-agente configurada
- [x] Stack definida e validada
- [ ] Auth + Multi-tenancy base
- [ ] Agenda + Profissionais + Serviços
- [ ] Cliente CRM básico
- [ ] Caixa + Comissões
- [ ] Deploy staging

### Fase 2 — Intelligence (Q2 2027)
- [ ] Marketing automation engine
- [ ] Fidelidade + Pacotes + Recorrência
- [ ] Analytics dashboard v1
- [ ] WhatsApp Business API integration
- [ ] Mobile PWA otimizada

### Fase 3 — Scale (Q3 2027)
- [ ] Multi-unidade / Franquias
- [ ] Marketplace de profissionais
- [ ] IA: Previsão de demanda + Sugestão de preços
- [ ] API pública para integrações
- [ ] White-label para redes

### Fase 4 — Ecosystem (Q4 2027+)
- [ ] App nativo iOS/Android (React Native)
- [ ] PDV offline-first
- [ ] Integração contabilidade (ContaAzul, Omie)
- [ ] Marketplace de add-ons
- [ ] Comunidade de barbeiros

---

## 🤝 Contribuindo

O Navio Barber 2.0 usa **Code Sovereignty**: o Comandante (Claude Opus) integra todos os diffs. Workers operam em worktrees isoladas via Aletheia.

### Fluxo de Contribuição

1. **Issue** → Discussão arquitetural no GitHub Issues
2. **Plan** → Aletheia cria playbook com budget/quota
3. **Work** → Workers (Claude Subagents / Copilot Fleet) em worktrees isoladas
4. **Review** → Haiku/GPT-4o-mini code review automatizado
5. **Integrate** → Opus integra diffs via Edit/Write no main checkout
6. **Deploy** → CI/CD valida e promove para staging/prod

### Padrões de Código

- **TypeScript strict mode** — zero `any`, types first
- **Conventional Commits** — `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- **Branch naming** — `alethe/<session>-<worker>/<slug>`
- **PR Template** — Checklist de qualidade, breaking changes, migration notes

---

## 📄 Licença

**Proprietary** — Todos os direitos reservados.  
Uso restrito à organização Navio Barber e parceiros autorizados.

---

## 📞 Contato & Suporte

- **Repositório**: [github.com/seu-org/navio-barber-2.0](https://github.com/seu-org/navio-barber-2.0)
- **Issues**: [GitHub Issues](https://github.com/seu-org/navio-barber-2.0/issues)
- **Documentação**: `/docs` + Storybook (design system)
- **Status Page**: [status.naviobarber.com](https://status.naviobarber.com)

---

## 🏷️ Versionamento

Este projeto segue [SemVer 2.0](https://semver.org/).  
Versão atual: **2.0.0-alpha.1** (Em desenvolvimento ativo)

---

> **Navio Barber 2.0** — *Onde a tradição da barbearia encontra a tecnologia do futuro.* ⚓✂️