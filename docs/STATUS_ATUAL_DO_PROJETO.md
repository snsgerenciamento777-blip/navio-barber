# STATUS_ATUAL_DO_PROJETO.md

Status Atual — Navio Barber 2.0
Última atualização: 2026-11-07 | Operador: Kilo Code | Orquestrador: Aletheia v23

---

## 1. Estado Geral

| Item | Status | Observação |
|------|--------|------------|
| Projeto | Em desenvolvimento (alpha 1) | Arquitetura definida, stack escolhida |
| Engenharia Reversa | Concluída (M04) | 16 endpoints HAR analisados, corpos capturados |
| Documentação M04 | Concluída | 5 entregáveis em Reverse/entregas/ |
| Auditoria M04 | Concluída | 1 erro de contagem, 4 reclassificações necessárias |
| Decisões do Comandante | Preparadas, pendentes aprovação | docs/DECISOES_DO_COMANDANTE.md |
| Fase 0 (Spec Kit) | Não iniciada | Aguardando aprovação das 8 decisões |
| Desenvolvimento MVP | Não iniciado | Nenhuma funcionalidade implementada |

---

## 2. Ecossistema de IA — Estado dos Agentes

| Agente | Instalado | Autenticado | Operacional | Integração Aletheia | Observação |
|--------|-----------|-------------|-------------|---------------------|------------|
| Claude Code | ✅ | ✅ OAuth | ✅ | ✅ Native | Único provider operacional via Aletheia |
| GitHub Copilot CLI | ✅ | ✅ GitHub | ⚠️ Parcial | ✅ Custom | Write bloqueado por permissão interativa |
| Agy / Antigravity | ✅ | ⚠️ Sessão apenas | ✅ (via sessão) | ✅ Native | GEMINI_API_KEY não persistida no sistema |
| Gemini CLI | ✅ | ❌ | ❌ | ❌ | Requer GEMINI_API_KEY |
| OpenCode | ✅ | ❌ | ❌ | ⚠️ Detectado | Requer `opencode auth login` |
| Kilo Code | ✅ (IDE) | ✅ OAuth | ✅ (IDE) | ❌ | Sem CLI, ponte via terminal VS Code |
| 9Router | ✅ | N/A | ⚠️ Parado | Gateway | Rodando em 0.0.0.0:20128 (risco segurança) |
| Kimi Code | ❌ | ❌ | ❌ | ❌ | Não instalado |

---

## 3. Documentação Existente

| Arquivo | Caminho | Status |
|---------|---------|--------|
| AI Ecosystem | docs/AI-ECOSYSTEM.md | ✅ Atual |
| Agent Team | docs/AGENT-TEAM.md | ✅ Atual |
| Implementation Roadmap | docs/IMPLEMENTATION-ROADMAP.md | ✅ Atual |
| Decisões Comandante | docs/DECISOES_DO_COMANDANTE.md | ✅ Criado (M06) |
| Diário Missões | docs/DIARIO_DE_MISSOES.md | ✅ Criado (M07) |
| Status Atual | docs/STATUS_ATUAL_DO_PROJETO.md | ✅ Criado (M07) |
| Mapa Funcional | Reverse/entregas/MAPA_FUNCIONAL_HORA_DO_ESTILO.md | ⚠️ Precisa correção (4 itens) |
| Matriz Telas/Fluxos | Reverse/entregas/MATRIZ_TELAS_E_FLUXOS.md | ⚠️ Precisa correção (67→80) |
| Matriz Regras | Reverse/entregas/MATRIZ_REGRAS_DE_NEGOCIO.md | ✅ OK |
| Lacunas | Reverse/entregas/LACUNAS_EVIDENCIAS_PENDENTES.md | ⚠️ Precisa correção (endpoints) |
| Relatório M04 | Reverse/entregas/RELATORIO_MISSAO_04.md | ⚠️ Precisa correção (67→80) |
| Auditoria M04 | Reverse/entregas/AUDITORIA_FINAL_MISSAO_04.md | ✅ Criado (M05) |
| Requisitos MVP | Reverse/entregas/REQUISITOS_FUNCIONAIS_MVP.md | ✅ Existente (M03) |

---

## 4. HAR — Evidências de Engenharia Reversa

| Item | Valor | Fonte |
|------|-------|-------|
| Arquivo HAR | Reverse/01_Hora_do_Estilo_Admin.har | 108 entries |
| Endpoints únicos Hora do Estilo | 16 | Todos com corpo capturado |
| Endpoints MercadoPago | 2 | /v1/payment_methods/search, /v1/devices/widgets |
| Bodies extraídos | Reverse/har_bodies_20261106.txt | 48 linhas, 14 endpoints Hora do Estilo |
| Extração completa | Reverse/har_extraction_20261106.txt | 147 linhas, resumo de todas as 108 entries |

---

## 5. Decisões Pendentes do Comandante (D-01 a D-08)

| ID | Decisão | Alternativas | Recomendação | Impacto MVP | Impacto Financeiro | Status |
|----|---------|-------------|-------------|-------------|-------------------|--------|
| D-01 | Pagamento online no MVP? | Sim / Não | Não (apenas presencial) | Define escopo financeiro | R$ 0 vs custos Mercado Pago | Pendente |
| D-02 | Login obrigatório cliente? | Sim / Não | Não (apenas telefone) | Define área cliente | R$ 0 vs mais telas | Pendente |
| D-03 | Canal notificação prioritário | Push / WhatsApp / Email / SMS / Múltiplos | Push (FCM) apenas | Define canais implementar | R$ 0 vs custo por msg | Pendente |
| D-04 | Antecedência mínima agendamento | Valor em horas (sug: 2) | 2 horas | Validação agendamento | R$ 0 | Pendente |
| D-05 | Antecedência máxima agendamento | Valor em dias (sug: 30) | 30 dias | Validação agendamento | R$ 0 | Pendente |
| D-06 | Limite no-shows bloqueio | Valor numérico (sug: 3) | 3 no-shows | Regras cliente | R$ 0 | Pendente |
| D-07 | Período inatividade cliente | Valor em meses (sug: 6) | 6 meses | Regras cliente | R$ 0 | Pendente |
| D-08 | Minutos atraso no-show automático | Valor em minutos (sug: 15) | 15 minutos | Controle atendimento | R$ 0 | Pendente |

---

## 6. Backups Criados

| Backup | Caminho | Conteúdo | Data |
|--------|---------|----------|------|
| backup-original | Reverse/entregas/backup-original/ | 8 arquivos originais M03 | M03 |
| backup-m06 | Reverse/entregas/backup-m06/ | 3 arquivos a corrigir (M04) | M07 |

---

## 7. Funcionalidades Candidatas ao MVP (20 itens)

### Essenciais (11 itens):
Login barbeiro, Perfil barbeiro, Dashboard resumo, Agenda slots, Consulta agendamentos por período, Cadastro clientes, Cadastro profissionais, Seleção funcionário, Finalização agendamentos, Registro pagamento presencial, Cancelamento agendamento.

### Importantes posteriores (8 itens):
Dados estabelecimento, Horário funcionamento, Dia fechado, Intervalo almoço, Catálogo planos/assinaturas, Notificações push FCM, Lista notificações, Status setup dashboard.

### Dependentes de decisão do Comandante (2 itens):
Pagamento online (D-01), Área pública cliente (D-02).

---

## 8. Próximos Passos

1. Aplicar 3 correções documentais (ETAPA 1 M07)
2. Revisão independente dos documentos corrigidos
3. Aguardar aprovação das 8 decisões D-01 a D-08
4. Iniciar Fase 0 (Spec Kit) após aprovação
5. Corrigir segurança 9Router (--host 127.0.0.1)
6. Persistir GEMINI_API_KEY no sistema (setx)
7. Autenticar OpenCode (opencode auth login)
