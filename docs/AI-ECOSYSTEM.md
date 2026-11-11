# Navio Barber 2.0 — AI Ecosystem Documentation

> **Versão:** 1.0  
> **Data:** 2026-11-06  
> **Responsável:** Claude Code (Opus 5.5)  
> **Orquestrador:** Aletheia v23

---

## 1. Visão Geral

Este documento consolida todo o ecossistema de IA configurado para o projeto Navio Barber 2.0, incluindo Skills instaladas, ferramentas disponíveis, agentes operacionais, integrações e custos.

---

## 2. Skills Avaliadas e Instaladas

### 2.1 Skills Prioritárias (9 Repositórios Oficiais)

| # | Skill / Repositório | Status | Categoria | Link Oficial | Função Principal |
|---|---------------------|--------|-----------|--------------|------------------|
| 1 | **reverse-api-engineer** (kalil0321) | 🔄 Avaliada | Engenharia Reversa | [github.com/kalil0321/reverse-api-engineer](https://github.com/kalil0321/reverse-api-engineer) | Mapear APIs, gerar clientes tipados a partir de tráfego HAR |
| 2 | **spec-kit** (GitHub) | 🔄 Avaliada | Spec-Driven Dev | [github.com/github/spec-kit](https://github.com/github/spec-kit) | Criar especificações antes da implementação (SDD) |
| 3 | **claude-mem** (thedotmack) | ✅ **Já Integrada** | Memória/Contexto | [github.com/thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | Persistir contexto cross-session com compressão IA |
| 4 | **scrapling** (D4Vinci) | 🔄 Avaliada | Web Automation | [github.com/D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | Web scraping, browser automation, MCP server para agentes |
| 5 | **unslop** (heydamir) | 🔄 Avaliada | UI/UX Quality | [github.com/heydamir/unslop](https://github.com/heydamir/unslop) | Auditar e corrigir interfaces "vibecoded" |
| 6 | **CLI-Anything** (HKUDS) | 🔄 Avaliada | CLI Development | [github.com/HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) | Transformar software em CLIs agent-native |
| 7 | **worktrunk** (max-sixty) | 🔄 Avaliada | Git Worktrees | [github.com/max-sixty/worktrunk](https://github.com/max-sixty/worktrunk) | Gerenciar worktrees para agentes paralelos |
| 8 | **lgpd-skills** (goul4rt) | 🔄 Avaliada | LGPD/Security | [github.com/goul4rt/lgpd-skills](https://github.com/goul4rt/lgpd-skills) | 19 skills para conformidade LGPD/ANPD |
| 9 | **lgpd-app/skills** | 🔄 Avaliada | LGPD/Security | [github.com/lgpd-app/skills](https://github.com/lgpd-app/skills) | 2 skills: lgpd-check (auditoria web) + lgpd-md |
| 10 | **mattpocock/skills** | 🔄 Avaliada | Engineering | [github.com/mattpocock/skills](https://github.com/mattpocock/skills) | 19 skills: arquitetura, code-review, TDD, domain-modeling |

### 2.2 Skills Nativas do Projeto (Já Instaladas)

| Skill | Versão | Caminho | Status |
|-------|--------|---------|--------|
| **alethe** (Aletheia) | v23 | `.agents/skills/alethe/` | ✅ Operacional |
| **Web Lens** | 0.2.17 | VS Code Extension | ✅ Instalada |
| **Playwright MCP** | latest | `~/.copilot/mcp-config.json` | ✅ Configurada |
| **Context7 MCP** | 4.5.0 | `~/.copilot/mcp-config.json` | ✅ Configurada |
| **API Reverse Engineer** | 1.10.0 | Chrome Extension (temp) | ✅ Validada |

---

## 3. Ferramentas Instaladas e Configuradas

### 3.1 CLIs de Agentes (Sistema)

| Ferramenta | Versão | Caminho | Autenticada | Operacional |
|------------|--------|---------|-------------|-------------|
| **Claude Code** | 2.1.318 | `C:\Users\User\.local\bin\claude.EXE` | ✅ OAuth | ✅ Sim |
| **GitHub Copilot CLI** | 1.0.105 | `C:\Users\User\AppData\Roaming\npm\copilot.cmd` | ✅ GitHub OAuth | ✅ Sim |
| **Agy / Antigravity** | 1.4.10 | `C:\Users\User\AppData\Local\agy\bin\agy.EXE` | ✅ Sessão (chave válida) | ✅ Operacional (gemini-3.6-flash) |
| **Gemini CLI** | 0.67.0 | `C:\Users\User\AppData\Roaming\npm\gemini.cmd` | ✅ Sessão (chave válida) | ✅ Operacional (gemini-3.1-flash-lite) |
| **OpenCode** | 2.2.5 | `C:\Users\User\AppData\Roaming\npm\opencode.cmd` | ❌ Não autenticado | ❌ Não |
| **KiloCode** | - | VS Code Extension apenas | ✅ OAuth | ✅ (IDE apenas) |
| **9Router** | 0.5.112 | `C:\Users\User\AppData\Roaming\npm\9router.cmd` | N/A (Gateway) | ✅ Rodando* |

> ⚠️ **CRÍTICO**: 9Router exposto em `0.0.0.0:20128` (HTTP plaintext). Deve rodar com `--host 127.0.0.1`.

### 3.2 Extensões VS Code

| Extensão | ID | Status |
|----------|-----|--------|
| Claude Code | `anthropic.claude-code` | ✅ Ativa |
| Gemini CLI IDE Companion | `google.gemini-cli-vscode-ide-companion` | ✅ Ativa |
| Gemini Code Assist | `google.geminicodeassist` | ✅ Ativa |
| KiloCode | `kilocode.kilo-code` | ✅ Ativa |
| OpenAI ChatGPT | `openai.chatgpt` | ✅ Ativa |
| OpenAI Codex Audio | `openai.codex-audio` | ✅ Ativa |
| Claude Dev (saoudrizwan) | `saoudrizwan.claude-dev` | ✅ Ativa |
| OpenCode | `sst-dev.opencode` | ✅ Ativa |

---

## 4. Integração com Aletheia v23

### 4.1 Providers Nativos (Built-in)

| Provider | ID Aletheia | Status | Comando Launch |
|----------|-------------|--------|----------------|
| **Claude Code** | `claude` | ✅ Operacional | `claude --print --output-format stream-json --verbose --permission-mode acceptEdits --disallowedTools Agent,Workflow --strict-mcp-config --model <m> --effort <e>` |
| **Agy / Antigravity** | `agy` | ⚠️ Requer API Key | `agy --output-format json --mode accept-edits --print-timeout 300s --add-dir <cwd> --print=<task>` |
| **Codex** | `codex` | ❌ Não instalado | `codex --disable multi_agent exec --sandbox workspace-write --json --output-last-message <result> --cd <cwd> --config mcp_servers={} -` |
| **Kimi** | `kimi` | ❌ Não instalado | `kimi --output-format stream-json --prompt=<task>` |

### 4.2 Custom Providers (Configurados)

| Provider | Comando Base | Status | Modelos |
|----------|--------------|--------|---------|
| **GitHub Copilot CLI** | `copilot -p "{task}" --yolo --output-format json -C "{cwd}" --session-id "{session_id}"` | ✅ Testado | GitHub defaults, BYOK Anthropic, OpenAI, Azure, Ollama, 9Router |

### 4.3 Providers NÃO Acionáveis pela Aletheia

| Ferramenta | Motivo |
|------------|--------|
| **KiloCode (VS Code)** | Apenas extensão IDE, sem CLI exposto |
| **Gemini CLI** | Não autenticado, sem integração nativa |
| **VS Code Extensions** | Apenas IDE, sem CLI worker |
| **9Router** | Gateway, não worker (usa via BYOK) |

---

## 5. Modelos Disponíveis por Agente

### 5.1 Claude Code (First-Party Subscription — $0 marginal)

| Modelo | Disponível | Acesso | Custo |
|--------|------------|--------|-------|
| **Opus 5.5** | ✅ | `claude --model opus` | $0 (subscription) |
| **Sonnet 5.5** | ✅ | `claude --model sonnet` | $0 (subscription) |
| **Haiku 5.5** | ✅ | `claude --model haiku` | $0 (subscription) |
| **Fable 5.1** | ✅ | `claude --model fable` | $0 (subscription) |

### 5.2 GitHub Copilot CLI

| Fonte | Modelos | Status | Custo |
|-------|---------|--------|-------|
| **GitHub Copilot (Padrão)** | GPT-6 Luna, MAI-Code-1.1-Flash, GPT-5.x | ✅ Auto-seleção | AI Credits (plano) |
| **BYOK Anthropic** | Claude Opus/Sonnet/Haiku/Fable | ✅ Suportado | API Anthropic |
| **BYOK OpenAI** | GPT-4, GPT-4o, GPT-5, o1, etc. | ✅ Suportado | API OpenAI |
| **BYOK Azure OpenAI** | Deployments customizados | ✅ Suportado | API Azure |
| **BYOK Local (Ollama)** | Modelos locais | ✅ Suportado | Gratuito (local) |
| **Via 9Router** | Qualquer modelo roteado | ✅ Suportado | Conforme gateway |

### 5.3 Agy / Antigravity (Requer `GEMINI_API_KEY`)

| Modelo | Disponível | Status |
|--------|------------|--------|
| **Gemini (Google)** | Configurado | ❌ Requer `GEMINI_API_KEY` |

---

## 6. Capacidades Técnicas por Agente

| Capacidade | Claude Code | Copilot CLI | Agy | OpenCode | 9Router | KiloCode |
|------------|-------------|-------------|-----|----------|---------|----------|
| Editar arquivos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (IDE) |
| Executar terminal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (IDE) |
| Git / Worktrees | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (IDE) |
| Não-interativo (CLI) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Output estruturado | ✅ JSONL | ✅ JSONL | ✅ JSON | ✅ | N/A | ❌ |
| Sessões isoladas | ✅ `--resume` | ✅ `--session-id` | ✅ `--conversation` | ✅ | N/A | ❌ |
| Worktrees isolados | ✅ | ✅ Testado | ✅ | ⚠️ | N/A | ❌ |
| Execução paralela | ✅ Subagents | ✅ Fleet mode | ❌ | ❌ | N/A | ❌ |
| Agentes especializados | ✅ Subagent types | ✅ Skills/Agents | ❌ | ❌ | N/A | ❌ |
| MCP Servers | ✅ | ✅ Built-in + custom | ❌ | ✅ | N/A | ❌ |
| Integração Aletheia | ✅ Native | ✅ Custom Provider | ✅ Native | ⚠️ Detectado | ❌ | ❌ |

---

## 7. Funções Delegáveis por Agente

| Função | Claude Code | Copilot CLI | Agy | OpenCode | KiloCode |
|--------|-------------|-------------|-----|----------|----------|
| **Arquiteto / Planejamento** | ✅ Opus | ✅ GPT-5.5 (BYOK/9Router) | ❌ | ⚠️ | ❌ |
| **Implementação Backend** | ✅ Sonnet | ✅ GPT-5 (BYOK/9Router) | ❌ | ⚠️ | ❌ |
| **Implementação Frontend** | ✅ Sonnet | ✅ GPT-5 (BYOK/9Router) | ❌ | ⚠️ | ✅ (IDE) |
| **Code Review** | ✅ Haiku/Sonnet | ✅ GPT-4o-mini (BYOK) | ❌ | ⚠️ | ❌ |
| **Pesquisa / Análise** | ✅ Haiku | ✅ Fleet + Web | ❌ | ⚠️ | ❌ |
| **Documentação** | ✅ Haiku | ✅ GPT-4o-mini | ❌ | ⚠️ | ❌ |
| **Testes / Validação** | ✅ Haiku | ✅ GPT-4o-mini | ❌ | ⚠️ | ❌ |
| **Refatoração** | ✅ Sonnet | ✅ GPT-5 | ❌ | ⚠️ | ❌ |
| **Debugging** | ✅ Opus/Sonnet | ✅ GPT-5 | ❌ | ⚠️ | ❌ |

---

## 8. Paralelismo e Isolamento

### 8.1 Paralelismo Nativo

| Ferramenta | Mecanismo | Isolamento | Limite |
|------------|-----------|------------|--------|
| **Claude Code** | `Agent` tool múltiplos | Subagents (processos separados) | Quota subscription |
| **Copilot CLI** | `--fleet` + `--session-id` | Subagents (fleet) + Sessões (CLI) | AI Credits por sessão |
| **Agy** | Não suporta | N/A | N/A |

### 8.2 Paralelismo Cross-Ferramenta (Aletheia)

| Combinação | Isolamento | Coordenação |
|------------|------------|-------------|
| **Claude (worktree A) + Copilot (worktree B)** | ✅ Worktrees Git isoladas | Aletheia via handoff.md |
| **Claude (main) + Copilot (worktree)** | ✅ Parcial | Aletheia lead integra |
| **Múltiplos Copilot (sessões diferentes)** | ✅ Sessões + Worktrees | Aletheia coordena |

### 8.3 Matriz de Concorrência Segura

| Cenário | Seguro | Observação |
|---------|--------|------------|
| 2+ Claude Subagents | ✅ | Isolamento por processo |
| 2+ Copilot Sessions | ✅ | Isolamento por `--session-id` + worktree |
| 1 Claude + 1 Copilot | ✅ | Worktrees separadas obrigatórias |
| 2+ Agy | ❌ | Não suporta paralelismo |
| Claude + Agy | ✅ | Worktrees separadas |

---

## 9. Orquestração Aletheia — Perfis de Custo

| Perfil | Tier Cheap | Tier Standard | Tier Strong | Uso |
|--------|------------|---------------|-------------|-----|
| **savings** | Haiku / GPT-4o-mini | Sonnet / GPT-5 | Opus / GPT-5.5 | Economia máxima |
| **balanced** | Haiku / GPT-4o-mini | Sonnet / GPT-5 | Opus / GPT-5.5 | Padrão (recomendado) |
| **aggressive** | Sonnet / GPT-5 | Opus / GPT-5.5 | Opus xhigh / GPT-5.5 | Qualidade máxima |

### 9.1 Roteamento Inteligente por Fase

| Fase | Equipe Primária | Equipe Secundária | Gateway |
|------|-----------------|-------------------|---------|
| **Pesquisa/Análise** | Claude Haiku (fleet) | Copilot Fleet (GPT-5) | 9Router para web |
| **Planejamento/Arquitetura** | Claude Opus | Copilot GPT-5.5 (BYOK) | 9Router fallback |
| **Implementação Backend** | Claude Sonnet | Copilot GPT-5 (BYOK) | - |
| **Implementação Frontend** | Claude Sonnet | Copilot GPT-5 (BYOK) | - |
| **Code Review** | Claude Haiku | Copilot GPT-4o-mini | - |
| **Testes/Validação** | Claude Haiku | Copilot GPT-4o-mini | - |
| **Documentação** | Claude Haiku/Fable | Copilot GPT-4o-mini | - |
| **Integração Final** | **Claude Opus (Lead)** | - | - |

---

## 10. Segurança e Compliance

### 10.1 LGPD Skills Disponíveis

**goul4rt/lgpd-skills** (19 skills):
- `lgpd-audit` (maestro), `lgpd-legal-basis`, `lgpd-data-mapping`, `lgpd-ropa`, `lgpd-ripd`, `lgpd-consent-schema`, `lgpd-dsar`, `lgpd-privacy-policy`, `lgpd-incident-response`, `lgpd-dpo-encarregado`, `lgpd-dpa`, `lgpd-international-transfer`, `lgpd-vendor-audit`, `lgpd-audit-logging`, `lgpd-encryption-keys`, `lgpd-anonymization`, `lgpd-retention-erasure`, `lgpd-eca-digital-minors`, `lgpd-legacy-retrofit`

**lgpd-app/skills** (2 skills):
- `lgpd-check` — Audita websites (6 módulos)
- `lgpd-md` — Gera/valida `lgpd.md`

### 10.2 Configurações Críticas de Segurança

| Item | Status | Ação Necessária |
|------|--------|-----------------|
| **9Router exposto 0.0.0.0** | 🔴 CRÍTICO | Reiniciar com `--host 127.0.0.1` |
| **GEMINI_API_KEY definida (sessão)** | ✅ Ativa | Chave válida configurada apenas nesta sessão; modelos Free Tier validados |
| **API Keys em config files** | ✅ OK | Nenhuma chave em arquivos (apenas env vars) |
| **Claude OAuth** | ✅ Ativa | Token first-party válido |
| **Copilot GitHub OAuth** | ✅ Ativa | Token refresh automático |

---

## 11. Custos Estimados

| Ferramenta | Modelo de Custo | Limite Conhecido | Estimativa Mensal |
|------------|-----------------|------------------|-------------------|
| **Claude Code** | Subscription | 5h janela/semana | $0 marginal |
| **Copilot CLI** | AI Credits (plano GitHub) | Conforme plano | Variável |
| **Copilot BYOK Anthropic** | Pay-per-use | Rate limits API | $3-15/M tokens |
| **Copilot BYOK OpenAI** | Pay-per-use | Rate limits API | $2-30/M tokens |
| **Agy (Gemini)** | Pay-per-use Google | Rate limits | $0.075-3.50/M tokens |
| **9Router Gateway** | Gratuito + provedores | N/A | $0 + modelos |

---

## 12. Dependências do Sistema

| Ferramenta | Dependências |
|------------|--------------|
| **Aletheia** | Python 3.9+ (✅ 3.14.10), Git, tmux (para worktrees paralelos) |
| **Copilot CLI** | Node.js (via npm), Git, GitHub OAuth |
| **Agy** | Python, `GEMINI_API_KEY` |
| **9Router** | Node.js, portas 20128 livres |
| **Claude Code** | Assinatura Anthropic ativa |
| **reverse-api-engineer** | uv, playwright chromium |
| **spec-kit** | Python 3.11+, uv |
| **scrapling** | Python, `pip install "scrapling[all]"` |
| **worktrunk** | Cargo/Rust ou Homebrew/WinGet |

---

## 13. Classificação por Tipo

| Categoria | Ferramentas |
|-----------|-------------|
| **Local (CLI)** | Claude Code, Copilot CLI, Agy, Gemini CLI, OpenCode, worktrunk |
| **Nuvem / API Externa** | 9Router, BYOK providers, Gemini API, Mercado Pago, FCM |
| **Serviço Hospedado** | GitHub Copilot (cloud), Context7 MCP, Playwright MCP |
| **Extensão IDE** | KiloCode, Web Lens, VS Code extensions |
| **MCP Server** | Playwright MCP, Context7 MCP, github-mcp-server |
| **Skill** | alethe, unslop, lgpd-skills, mattpocock/skills, spec-kit |
| **Chrome Extension** | API Reverse Engineer |

---

## 14. Comandos de Utilização

### 14.1 Aletheia
```bash
# Doctor / status
py -3 .agents/skills/alethe/scripts/orchestrate.py doctor

# Nova orquestração
py -3 .agents/skills/alethe/scripts/orchestrate.py new "Título" --playbook complete --why "Motivo" --lead claude:opus

# Executar wave
py -3 .agents/skills/alethe/scripts/orchestrate.py run plan.json --in current --detach
py -3 .agents/skills/alethe/scripts/orchestrate.py wait

# Relatório
py -3 .agents/skills/alethe/scripts/orchestrate.py report

# Budget
py -3 .agents/skills/alethe/scripts/orchestrate.py budget --max-calls 20 --max-reported-cost-usd 5
```

### 14.2 Copilot CLI
```bash
# Non-interactive
copilot -p "task" --yolo --output-format json

# Fleet mode
copilot -p "task" --fleet --yolo

# Sessão isolada
copilot -p "task" --session-id <UUID> --yolo

# Worktree
copilot -p "task" -C ../worktree-path --yolo
```

### 14.3 Outras CLIs
```bash
# reverse-api-engineer
uv tool install reverse-api-engineer
reverse-api-engineer

# spec-kit
uv tool install specify-cli
specify init my-project --integration copilot

# scrapling
pip install "scrapling[all]"
scrapling install

# worktrunk
winget install max-sixty.worktrunk
wt config shell install
```

---

## 15. Como Atualizar

| Ferramenta | Comando de Atualização |
|------------|------------------------|
| **Aletheia (skill)** | `git pull` em `.agents/skills/alethe/` + `playbook --init --force` |
| **Copilot CLI** | `npm update -g @github/copilot-cli` |
| **Claude Code** | Atualização automática via OAuth |
| **Agy** | Verificar releases no GitHub |
| **9Router** | `npm update -g 9router` |
| **Skills (claude-mem)** | `/plugin update` ou `npx claude-mem install` |
| **Worktrunk** | `winget upgrade max-sixty.worktrunk` |
| **reverse-api-engineer** | `uv tool upgrade reverse-api-engineer` |

---

## 16. Como Remover

| Ferramenta | Comando de Remoção |
|------------|---------------------|
| **Aletheia** | Remover `.agents/skills/alethe/` + `rm -rf ~/AppData/Roaming/Alethe` |
| **Copilot CLI** | `npm uninstall -g @github/copilot-cli` |
| **Agy** | Desinstalar via instalador original |
| **9Router** | `npm uninstall -g 9router` |
| **Worktrunk** | `winget uninstall max-sixty.worktrunk` |
| **Skills globais** | Remover de `~/.claude/skills/` |
| **Skills do projeto** | Remover de `.claude/skills/` |

---

## 17. Limitações Identificadas

1. **Agy/Gemini CLI**: `GEMINI_API_KEY` válida configurada apenas nesta sessão (não persistida); modelos Free Tier validados: `gemini-3.1-flash-lite` (Gemini CLI) e `gemini-3.6-flash` (Agy)
2. **OpenCode**: Não autenticado, integração Aletheia não testada
3. **Codex/Kimi**: Não instalados — menos opções de fallback
4. **KiloCode**: Apenas IDE, não integra com Aletheia como worker CLI
5. **9Router**: Segurança crítica — exposto em 0.0.0.0 sem TLS
6. **Paralelismo Agy**: Não suporta execução paralela nativa
7. **Gemini CLI**: Sem integração nativa Aletheia
8. **spec-kit**: Requer Python 3.11+ e uv (verificar versão)

---

## 18. Próximos Passos (Ações Pendentes)

| # | Ação | Comando | Prioridade |
|---|------|---------|------------|
| 1 | **Onboarding Aletheia completo** | `playbook --init` → editar → `policy set` | 🔴 Crítica |
| 2 | **GEMINI_API_KEY (sessão)** | Chave válida definida nesta sessão; modelos Free Tier validados e integrados à Aletheia | ✅ Resolvido (sessão) |
| 3 | **Budget padrão Aletheia** | `policy set --max-calls 20 --max-reported-cost-usd 5` | 🔴 Crítica |
| 4 | **Segurança 9Router** | `9router --host 127.0.0.1 --port 20128` | 🔴 Crítica |
| 5 | **Autenticar OpenCode** | `opencode auth login` | 🟡 Importante |
| 6 | **Testar BYOK Anthropic** | `COPILOT_PROVIDER_TYPE=anthropic ... copilot -p "test"` | 🟡 Importante |
| 7 | **Testar 9Router Gateway** | `COPILOT_PROVIDER_BASE_URL=http://127.0.0.1:20128/v1 ...` | 🟡 Importante |
| 8 | **Configurar Custom Provider Copilot** | Editar playbooks.yaml adapters | 🟡 Importante |
| 9 | **Instalar skills prioritárias** | Ver seção 2.1 | 🟢 Desejável |
| 10 | **Teste integração completa** | Plan 2 workers (Claude + Copilot) | 🟢 Desejável |

---

*Documento gerado automaticamente como parte da Missão Principal: Equipar o Projeto Navio Barber com o Melhor Ecossistema de Skills, Agentes e Ferramentas de IA.*