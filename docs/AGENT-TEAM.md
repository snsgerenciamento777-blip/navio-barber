# Navio Barber 2.0 — Agent Team Configuration

> **Versão:** 1.0  
> **Data:** 2026-11-06  
> **Orquestrador:** Aletheia v23  
> **Comandante:** Claude Code (Opus 5.5)

---

## 1. Hierarquia da Tripulação

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMANDANTE: CLAUDE CODE (OPUS 5.5)                   │
│              Orquestração suprema, decisões arquiteturais,                   │
│              integração final, code sovereignty                              │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ORQUESTRADOR: ALETHEIA (v23)                           │
│         Planejamento, delegação, budget, quota, worktrees, relatórios        │
│         Playbooks: complete, audit-at-scale, research, quality, parallel    │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   EQUIPE CLAUDE     │     │   EQUIPE COPILOT    │     │   GATEWAY 9ROUTER   │
│   (Subscription)    │     │   (AI Credits/BYOK) │     │   (Roteamento)      │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│ Opus: Arquiteto     │     │ GPT-5.5: Arquiteto  │     │ Modelos: Todos      │
│ Sonnet: Implement.  │     │ GPT-5: Implement.   │     │ Roteia por custo/   │
│ Haiku: Review/Docs  │     │ GPT-4o-mini: Review │     │ capacidade          │
│ Fable: Análise      │     │ Fleet: Paralelo     │     │ BYOK: Anthropic/    │
│                     │     │ Sessões: Isoladas   │     │ OpenAI/Azure/Ollama │
│ Worktrees isoladas  │     │ Worktrees isoladas  │     │                     │
│ Subagents paralelos │     │ Agents customizados │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTEXTO COMPARTILHADO (Aletheia)                         │
│  • Handoff.md por worker      • State.json + Journal.jsonl                  │
│  • Diff.patch + Outcome.json  • AGENTS.md / CLAUDE.md unificados            │
│  • Budget tracking            • Quota monitoring                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Matriz de Estado dos Agentes

| Agente | Instalado | Autenticado | Configurado | Operacional | Testado | Integração Aletheia |
|--------|-----------|-------------|-------------|-------------|---------|---------------------|
| **Claude Code** | ✅ | ✅ OAuth | ✅ | ✅ | ✅ | ✅ Native Provider |
| **GitHub Copilot CLI** | ✅ | ✅ GitHub | ✅ | ✅ | ✅ | ✅ Custom Provider |
| **Agy / Antigravity** | ✅ | ❌ | ⚠️ Parcial | ❌ | ❌ | ✅ Native Provider |
| **Gemini CLI** | ✅ | ❌ | ⚠️ Parcial | ❌ | ❌ | ❌ |
| **OpenCode** | ✅ | ❌ | ⚠️ Parcial | ❌ | ❌ | ⚠️ Detectado |
| **KiloCode** | ✅ (VS Code) | ✅ OAuth | ✅ | ✅ (IDE) | ❌ (sem CLI) | ❌ |
| **Kimi Code** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **9Router** | ✅ | N/A | ⚠️ Segurança | ✅ | ✅ | Gateway (BYOK) |

---

## 3. Especialidades e Responsabilidades

### 3.1 Equipe Claude (Subscription — $0 marginal)

| Modelo | Especialidade | Responsabilidades | Quando Usar |
|--------|---------------|-------------------|-------------|
| **Opus 5.5** | Arquiteto Supremo | Decisões arquiteturais, integração final, code sovereignty, debugging complexo | Fase de planejamento, decisões críticas, integração de diffs |
| **Sonnet 5.5** | Implementador Principal | Backend, Frontend, APIs, Database, Refatoração | Implementação de features, tarefas de engenharia padrão |
| **Haiku 5.5** | Revisor / Documentador | Code review, testes, documentação, tarefas mecânicas | Review de diffs, escrita de testes, documentação |
| **Fable 5.1** | Analista | Análise de código, pesquisa, domain modeling | Análise profunda, domain modeling, research |

### 3.2 Equipe Copilot (AI Credits / BYOK)

| Configuração | Modelo | Especialidade | Responsabilidades | Quando Usar |
|--------------|--------|---------------|-------------------|-------------|
| **Padrão (Auto)** | GPT-6 Luna / MAI-Code | Implementação Geral | Features paralelas, fleet mode | Trabalho de volume, implementação paralela |
| **BYOK Anthropic** | Claude Opus/Sonnet/Haiku | Implementação com modelos Claude | Quando quota Claude Code baixa | Fallback para modelos Claude |
| **BYOK OpenAI** | GPT-5, GPT-4o, o1 | Implementação com OpenAI | Tasks específicas OpenAI | Quando modelos OpenAI preferidos |
| **BYOK 9Router** | Multi-modelo | Roteamento inteligente | Otimização custo/qualidade | Via gateway 9Router |
| **Fleet Mode** | Múltiplos | Paralelismo interno | Múltiplas features simultâneas | Implementação paralela massiva |

### 3.3 Agentes Complementares

| Agente | Status | Potencial | Bloqueadores |
|--------|--------|-----------|--------------|
| **Agy / Antigravity** | ⚠️ Parcial | Worker secundário para tarefas Gemini | `GEMINI_API_KEY` ausente |
| **Gemini CLI** | ⚠️ Parcial | Pesquisa web, análise | `GEMINI_API_KEY` ausente |
| **OpenCode** | ❌ Não autenticado | Worker terciário multi-modelo | Autenticação necessária |
| **Kimi Code** | ❌ Não instalado | Alternativa para tarefas específicas | Instalação necessária |

---

## 4. Fluxo de Comunicação

### 4.1 Protocolo Aletheia

1. **Comandante (Opus)** define objetivo e constraints
2. **Aletheia** seleciona playbook, cria plano, aloca workers
3. **Workers** executam em worktrees isoladas com briefs estruturados
4. **Workers** retornam: `diff.patch`, `outcome.json`, `result.md`, `STATUS:`, `SUMMARY:`
5. **Aletheia** valida gates (checks, review)
6. **Comandante (Opus)** integra diffs aprovados no main checkout
7. **Aletheia** gera relatório final com custos e decisões

### 4.2 Formato de Brief (Worker Contract)

Cada brief DEVE conter:
- **Task goal**: Objetivo claro e mensurável
- **Definition of done**: Critérios de aceitação objetivos
- **Owned paths**: Arquivos/diretórios de propriedade exclusiva
- **Relevant repository rules**: Regras do projeto (CLAUDE.md, AGENTS.md)
- **Checks**: Comandos de validação obrigatórios
- **Forbidden changes**: O que NÃO modificar
- **Desired handoff**: O que passar para próxima fase

### 4.3 Invariantes do Worker (Anexadas Automaticamente)

- Não delegar, spawnar subagents, ou lançar outro agent CLI
- Não commitar, push, tag, release, ou abrir PR
- Retornar outcome conciso, evidence, changed files, checks, failures, risks
- Terminar com `STATUS:` (DONE, DONE_WITH_CONCERNS, BLOCKED, NEEDS_CONTEXT) e `SUMMARY:`

---

## 5. Permissões e Controle de Acesso

### 5.1 Code Sovereignty

| Princípio | Implementação |
|-----------|---------------|
| **Lead integra todos os diffs** | Apenas Opus (Comandante) usa Edit/Write no main checkout |
| **Workers isolados** | Cada writer worker em worktree própria (`isolate: true`) |
| **Branches nomeadas** | `alethe/<session>-<worker>/<slug>` |
| **Sessões rastreadas** | `--session-id` (Copilot) / `--resume` (Claude) |
| **Budget enforcado** | `--max-ai-credits` (Copilot) + `budget` no plan (Aletheia) |

### 5.2 Matriz de Permissões por Agente

| Ação | Claude Code | Copilot CLI | Agy | OpenCode | KiloCode |
|------|-------------|-------------|-----|----------|----------|
| Ler arquivos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Escrever arquivos (worktree) | ✅ | ✅ | ✅ | ✅ | ✅ (IDE) |
| Escrever arquivos (main) | ✅ (Lead only) | ❌ | ❌ | ❌ | ❌ |
| Git commit/push | ✅ (Lead only) | ❌ | ❌ | ❌ | ❌ |
| Executar terminal | ✅ | ✅ | ✅ | ✅ | ✅ (IDE) |
| Instalar dependências | ✅ | ✅ | ✅ | ✅ | ✅ (IDE) |
| Acessar MCP servers | ✅ | ✅ | ❌ | ✅ | ❌ |
| Spawn subagents | ✅ | ✅ (Fleet) | ❌ | ❌ | ❌ |

---

## 6. Isolamento e Segurança

### 6.1 Worktrees Git

```bash
# Criar worktree para worker
git worktree add ../navio-barber-worker-1 -b alethe/session-123/worker-1

# Worker opera em ../navio-barber-worker-1
# Ao finalizar: diff.patch gerado, worktree removida após integração
```

### 6.2 Sessões Isoladas

| Agente | Flag de Sessão | Isolamento |
|--------|----------------|------------|
| **Claude Code** | `--resume <session-id>` | Processo separado + context isolado |
| **Copilot CLI** | `--session-id <UUID>` | Sessão independente + worktree opcional |
| **Agy** | `--conversation <id>` | Conversa isolada |

### 6.3 Budget e Quota

| Controle | Ferramenta | Configuração |
|----------|------------|--------------|
| **Max calls por wave** | Aletheia | `budget.maxCalls: 20` |
| **Max custo USD por wave** | Aletheia | `budget.maxReportedCostUsd: 5.0` |
| **Max AI Credits Copilot** | Copilot CLI | `--max-ai-credits <N>` (mín 30) |
| **Quota threshold crítico** | Aletheia | `quota.criticalThreshold: 80%` |
| **Quota stop line** | Aletheia | `quota.stopAt: 95%` |

---

## 7. Playbooks Recomendados por Cenário

| Cenário | Playbook | Workers | Estratégia |
|---------|----------|---------|------------|
| **Feature nova (sequencial)** | `plan-execute` | 1-2 | Planner (Opus) → Executor (Sonnet) |
| **Features independentes** | `parallel-worktrees` | 2-4 | Worktrees isoladas, integração final |
| **Pesquisa/Auditoria** | `plan-big-execute-small` | 4 | Decompose (Opus) → Scouts (Haiku) → Synthesize (Opus) |
| **Bug complexo** | `advisor-escalation` | 1-2 | Executor (Sonnet) + Advisor (Opus) sob demanda |
| **Refatoração mecânica** | `cascade` | 1-3 | Cheap → Standard → Strong com checks automáticos |
| **Code review final** | `review-gate` | 1-2 | Triage (cheap) → Convention review → Bug hunt (strong) |
| **Muitos itens similares** | `audit-at-scale` | 8 | Extract → Check (cheap, 8 workers) → Skeptic → Report |

---

## 8. Configuração de Providers no Aletheia

### 8.1 Provider Order (Política Atual)

```json
{
  "providerOrder": ["claude", "agy"]
}
```

### 8.2 Custom Provider: Copilot CLI

```yaml
# Em playbooks.yaml → adapters
adapters:
  copilot:
    command: "copilot"
    args:
      - "-p"
      - "{task}"
      - "--yolo"
      - "--output-format"
      - "json"
      - "-C"
      - "{cwd}"
      - "--session-id"
      - "{session_id}"
    promptTransport: "argument"
    outputFormat: "jsonl"
    capabilities:
      readOnly: true
      write: true
      resume: true
      structuredOutput: true
      tokenUsage: true
```

### 8.3 Tiers por Provider (Profile: balanced)

```yaml
tiers:
  cheap:
    claude: { model: haiku, effort: low }
    agy: { model: gemini-1.5-flash, effort: low }
    copilot: { effort: low }
  standard:
    claude: { model: sonnet, effort: medium }
    agy: { model: gemini-1.5-pro, effort: medium }
    copilot: { effort: medium }
  strong:
    claude: { model: opus, effort: high }
    agy: { model: gemini-1.5-pro, effort: high }
    copilot: { effort: high }
```

---

## 9. Comandos Operacionais

### 9.1 Aletheia (Orquestração)

```bash
# Status rápido
/alethe status

# Nova orquestração
/alethe new "Implementar RF-BB-05" --playbook plan-execute --why "Nova feature agendamento"

# Ver budget
/alethe budget --max-calls 10 --max-reported-cost-usd 2

# Relatório
/alethe report

# Ver quota
/alethe usage

# Modo passivo (padrão)
/alethe passive

# Modo balanced (delegação ativa)
/alethe balanced

# Parar ondas
/alethe stop
```

### 9.2 Workers Diretos (Sem Aletheia)

```bash
# Claude Subagent paralelo
# (Usar tool Agent no Claude Code com model: sonnet/haiku)

# Copilot sessão isolada
copilot -p "Implementar service X" --session-id $(uuidgen) --yolo -C ../worktree-x

# Copilot fleet
copilot -p "Implementar módulo Y" --fleet --yolo

# Agy (após GEMINI_API_KEY)
agy --mode accept-edits --print "Tarefa de pesquisa"
```

---

## 10. Troubleshooting

### 10.1 Problemas Comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Worker falha com `auth_required` | CLI não autenticada | Autenticar CLI antes de usar no Aletheia |
| Quota excedida | Janela 5h/semana esgotada | Aguardar reset, trocar provider, ou usar tier mais barato |
| Worktree conflita | Arquivos modificados no main | `git stash` no main antes de criar worktree |
| Copilot `--yolo` falha | Permissões | Verificar se `--yolo` é suportado na versão |
| Agy não inicia | `GEMINI_API_KEY` ausente | `setx GEMINI_API_KEY "sua-chave"` |
| 9Router inacessível | Host 0.0.0.0 bloqueado | `9router --host 127.0.0.1 --port 20128` |

### 10.2 Logs e Debug

```bash
# Aletheia logs
ls ~/AppData/Roaming/Alethe/

# Copilot logs
copilot --help  # Ver flags de debug

# Claude Code logs
~/.claude/  # Transcripts JSONL
```

---

## 11. Métricas de Sucesso

| Métrica | Target | Medição |
|---------|--------|---------|
| **Tempo lead-to-integration** | < 30 min para features P0 | Aletheia report |
| **Custo por feature** | < $2 (subscription workers) | Aletheia budget tracking |
| **Taxa de integração first-try** | > 80% | Git history + Aletheia marks |
| **Paralelismo efetivo** | 2-4 workers simultâneos | Worktrees ativas |
| **Quota utilization** | < 70% janela 5h | Aletheia usage |
| **Zero security incidents** | 0 | 9Router localhost only, env vars only |

---

*Documento parte do ecossistema IA do Navio Barber 2.0. Atualizar conforme agentes são adicionados/removidos ou configurações mudam.*