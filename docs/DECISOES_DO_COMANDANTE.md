# DECISOES_DO_COMANDANTE.md

Decisões de Produto — Missão 06 / Fase 0 (Spec Kit)
Navio Barber 2.0 | Preparação para aprovação do Comandante
Data: 2026-11-07 | Operador: Kilo Code | Orquestrador: Aletheia v23

---

## 1. Contexto

Estas 8 decisões são necessárias antes de iniciar a Fase 0 (Spec Kit) e o desenvolvimento do MVP. Elas foram identificadas durante a Missão 04 (engenharia reversa do Hora do Estilo) e documentadas no `RELATORIO_MISSAO_04.md` (seção 6) e no `LACUNAS_EVIDENCIAS_PENDENTES.md` (seção 2.13).

Cada decisão apresenta o problema, as alternativas, uma recomendação técnica, o impacto no MVP, o impacto financeiro e as consequências de cada alternativa.

A linguagem é intencionalmente simples, sem exigir conhecimento de programação.

---

## 2. As Oito Decisões

---

### D-01 — Pagamento online no MVP?

**Qual problema precisa ser decidido:**
O aplicativo de referência (Hora do Estilo) aceita pagamento online via Mercado Pago (PIX e cartão de crédito), mas não sabemos se o Navio Barber 2.0 deve oferecer essa opção logo no lançamento inicial.

**Alternativas disponíveis:**
- **Sim:** Incluir pagamento online (PIX e cartão via Mercado Pago) no MVP
- **Não:** Apenas pagamento presencial (dinheiro, cartão na maquininha, PIX por aproximação, voucher) no MVP

**Recomendação técnica:** Não (apenas pagamento presencial).
O pagamento online exige integração com empresa externa (Mercado Pago), cuidados com segurança de dados financeiros e conformidade com leis de proteção de dados. Isso adiciona complexidade e tempo ao lançamento inicial.

**Impacto no MVP:**
- Se "Não": O módulo financeiro é mais simples — o barbeiro apenas registra que recebeu o pagamento presencialmente. O MVP lança mais rápido.
- Se "Sim": Exige integração com gateway de pagamento, testes de segurança e aprovação do Mercado Pago. O MVP demora mais para ficar pronto.

**Impacto financeiro:**
- "Não": R$ 0 adicional.
- "Sim": Custos de transação do Mercado Pago sobre cada venda + possíveis custos de certificados de segurança.

**Consequências de cada alternativa:**
- Escolher "Sim": O MVP já nasce preparado para cobrança online, mas demora mais para lançar e exige mais cuidados técnicos.
- Escolher "Não": O MVP lança mais rápido com custo zero adicional. O pagamento online pode ser adicionado na Fase 2.

---

### D-02 — Login obrigatório para o cliente?

**Qual problema precisa ser decidido:**
O arquivo HAR capturado é do lado administrativo (do barbeiro). Não há evidência de como o cliente se identifica para marcar um horário pelo app público.

**Alternativas disponíveis:**
- **Sim:** O cliente precisa criar uma conta (email e senha) para conseguir agendar.
- **Não:** O cliente agenda apenas informando o telefone, sem precisar criar conta.

**Recomendação técnica:** Não (apenas telefone).
Isso reduz a burocracia para o cliente marcar um horário. O barbeiro pode procurar o cliente existente pelo telefone ou cadastrá-lo rapidamente na hora.

**Impacto no MVP:**
- Se "Não": Não precisa de tela de cadastro do cliente, nem de tela de login, nem de recuperação de senha, nem de área logada do cliente. O MVP é mais simples e rápido de desenvolver.
- Se "Sim": Exige todas essas telas e fluxos, aumentando o tempo de desenvolvimento.

**Impacto financeiro:**
- "Não": R$ 0 adicional.
- "Sim": Mais telas para desenvolver e manter, maior custo de desenvolvimento.

**Consequências de cada alternativa:**
- Escolher "Sim": O cliente tem seu próprio histórico, pode ver seus agendamentos futuros e poderia acumular pontos de fidelidade. Mas o processo de agendamento é mais demorado.
- Escolher "Não": O agendamento é rápido e simples. Mas o cliente não tem uma área logada própria para gerenciar seus dados.

---

### D-03 — Canal de notificação prioritário?

**Qual problema precisa ser decidido:**
O HAR confirma apenas notificações por push (mensagens que aparecem no celular do usuário via Firebase/FCM). Não há evidência de notificações por WhatsApp, email ou SMS.

**Alternativas disponíveis:**
- Push (FCM) — já confirmado pelo HAR
- WhatsApp Business API
- Email
- SMS
- Múltiplos canais ao mesmo tempo

**Recomendação técnica:** Push (FCM) apenas.
É o único canal confirmado por evidência no aplicativo de referência. WhatsApp, email e SMS não estão no HAR e exigiriam integrações externas adicionais, cada uma com seus próprios custos e configurações.

**Impacto no MVP:**
Com push apenas, o sistema consegue notificar o barbeiro e o cliente sobre novos agendamentos, lembretes e cancelamentos, sem depender de operadoras de telefone ou serviços de email.

**Impacto financeiro:**
- Push: R$ 0 (o Firebase é gratuito para volumes iniciais de uso).
- WhatsApp: Custo por mensagem enviada.
- Email/SMS: Custo por envio.

**Consequências de cada alternativa:**
- Push apenas: Mais simples, custo zero, mas depende do cliente ter o aplicativo instalado no celular.
- WhatsApp: Maior alcance (quase todo mundo usa WhatsApp), mas custo por mensagem e exige integração com o Meta Business.
- Múltiplos canais: Mais flexível para o cliente escolher como prefere ser notificado, mas muito mais complexo de configurar e mais caro.

---

### D-04 — Antecedência mínima para agendamento

**Qual problema precisa ser decidido:**
Com quanto tempo de antecedência o cliente ou barbeiro pode marcar um atendimento? Por exemplo, dá para agendar para daqui a 30 minutos? Não há dado sobre isso no HAR.

**Alternativas disponíveis:**
- Qualquer valor em horas (valor sugerido: 2 horas)

**Recomendação técnica:** 2 horas.
Permite que o barbeiro tenha tempo de se preparar para o atendimento, mas não é tanto tempo a ponto de impedir agendamentos de última hora que o barbeiro poderia atender.

**Impacto no MVP:**
Define uma regra na tela de agendamento: se o usuário tentar marcar um horário para daqui a menos de 2 horas, o sistema não permite e avisa que a antecedência mínima é de 2 horas.

**Impacto financeiro:** R$ 0 (é apenas uma regra do sistema, não exige integração externa).

**Consequências de cada alternativa:**
- Valor baixo (ex: 30 minutos): Mais agendamentos de última hora são permitidos, mas aumenta o risco de o barbeiro ficar com horários ociosos de última hora.
- Valor alto (ex: 24 horas): Menos agendamentos de última hora, mais previsibilidade para o barbeiro, mas pode afastar clientes que querem marcar com pouca antecedência.

---

### D-05 — Antecedência máxima para agendamento

**Qual problema precisa ser decidido:**
Com quantos dias de antecedência se pode marcar um atendimento? Dá para marcar para daqui a 3 meses? Não há dado sobre isso no HAR.

**Alternativas disponíveis:**
- Qualquer valor em dias (valor sugerido: 30 dias)

**Recomendação técnica:** 30 dias.
É um período razoável para o cliente planejar com antecedência, sem abrir o calendário por um tempo indeterminado no futuro.

**Impacto no MVP:**
Define até que data o calendário mostra horários disponíveis. O cliente não consegue marcar um horário para daqui a mais de 30 dias.

**Impacto financeiro:** R$ 0.

**Consequências de cada alternativa:**
- Valor baixo (ex: 7 dias): O calendário mostra apenas uma semana à frente. Menos planejamento a longo prazo, mas menos risco de mudanças.
- Valor alto (ex: 90 dias): O calendário mostra 3 meses à frente. Mais planejamento, mas maior risco de o cliente precisar cancelar ou remarcar com muita antecedência.

---

### D-06 — Limite de no-shows para bloqueio automático

**Qual problema precisa ser decidido:**
Após quantas faltas sem aviso (no-show) o cliente deve ser bloqueado para não conseguir mais marcar horários? Não há dado sobre isso no HAR.

**Alternativas disponíveis:**
- Qualquer número (valor sugerido: 3)

**Recomendação técnica:** 3 no-shows.
É um limite razoável que dá chance ao cliente de justificar imprevistos, mas protege o barbeiro de faltas repetidas que deixam a agenda vazia.

**Impacto no MVP:**
Depois que o cliente acumular 3 faltas sem aviso, ele fica bloqueado para marcar novos horários. Só o barbeiro pode desbloqueá-lo manualmente.

**Impacto financeiro:** R$ 0.

**Consequências de cada alternativa:**
- Limite baixo (ex: 1): Bloqueia o cliente rapidamente após a primeira falta. Protege bem o barbeiro, mas pode perder um cliente por um único imprevisto justificável.
- Limite alto (ex: 5): Mais tolerante com o cliente, mas o barbeiro sofre mais com faltas repetidas antes que o bloqueio aconteça.

---

### D-07 — Período de inatividade para cliente inativo

**Qual problema precisa ser decidido:**
Após quanto tempo sem nenhum atendimento um cliente passa a ser considerado "inativo" no sistema? Não há dado sobre isso no HAR.

**Alternativas disponíveis:**
- Qualquer valor em meses (valor sugerido: 6 meses)

**Recomendação técnica:** 6 meses.
É um período suficiente para considerar que o cliente provavelmente não vai voltar tão cedo, mas não tão curto a ponto de marcar como inativo alguém que está de férias.

**Impacto no MVP:**
Clientes que não têm atendimentos há mais de 6 meses aparecem como "inativos" na lista de clientes, mas ainda podem marcar novos horários se quiserem.

**Impacto financeiro:** R$ 0.

**Consequências de cada alternativa:**
- Período curto (ex: 3 meses): Mais clientes aparecem como inativos. A lista de clientes ativos fica mais enxuta e focada em quem realmente usa o serviço.
- Período longo (ex: 12 meses): Poucos clientes são marcados como inativos. A lista fica mais cheia, mas inclui clientes que talvez não voltem mais.

---

### D-08 — Minutos de atraso para no-show automático

**Qual problema precisa ser decidido:**
Após quantos minutos de atraso o agendamento é considerado automaticamente como falta (no-show), liberando o horário para outro cliente? Não há dado sobre isso no HAR.

**Alternativas disponíveis:**
- Qualquer valor em minutos (valor sugerido: 15 minutos)

**Recomendação técnica:** 15 minutos.
Tempo razoável para tolerar atrasos menores (trânsito, esquecimento) sem prejudicar demais a agenda do barbeiro.

**Impacto no MVP:**
Se o cliente não comparecer e não avisar depois de 15 minutos do horário marcado, o sistema considera o agendamento como no-show e libera o horário para outro cliente marcar.

**Impacto financeiro:** R$ 0.

**Consequências de cada alternativa:**
- Valor baixo (ex: 5 minutos): Mais agendamentos são considerados no-show rapidamente. O barbeiro libera o horário mais cedo para outro cliente.
- Valor alto (ex: 30 minutos): Menos agendamentos são considerados no-show, mas o horário fica bloqueado por mais tempo esperando o cliente que pode não vir.

---

## 3. Aprovação do Comandante

**Status: APROVADO PELO COMANDANTE**  
**Decisões aprovadas: D-01 a D-08**  
**Data efetiva da aprovação: 2026-11-07**  
**Responsável pelo registro: Kilo Code**  
**Orquestração: Aletheia v23**

| ID | Decisão aprovada |
|---|---|
| D-01 | Não haverá pagamento online no MVP. Apenas pagamentos presenciais. |
| D-02 | O cliente poderá agendar informando telefone, sem login obrigatório. |
| D-03 | Push (FCM) será o canal prioritário de notificações. |
| D-04 | Antecedência mínima de agendamento: 2 horas. |
| D-05 | Antecedência máxima de agendamento: 30 dias. |
| D-06 | Bloqueio automático após 3 ocorrências de no-show. |
| D-07 | Cliente será classificado como inativo após 6 meses sem atendimento. |
| D-08 | Atraso de 15 minutos poderá gerar no-show automático, respeitando as proteções transacionais especificadas na Fase 0. |

---

## 4. Como Aprovar (histórico)

O Comandante deve escolher uma alternativa para cada uma das 8 decisões (D-01 a D-08). As escolhas definiram o escopo do MVP e quais funcionalidades serão desenvolvidas na Fase 0 (Spec Kit).

Após a aprovação, as decisões foram registradas e o desenvolvimento do Spec Kit pôde iniciar.

---

**Assinatura Digital:**
- Preparado por: Kilo Code
- Orquestrador: Aletheia v23
- Data: 2026-11-07
- Projeto: Navio Barber 2.0

⚓ **Navio Barber 2.0 — Navegar com evidências, construir com precisão.**
