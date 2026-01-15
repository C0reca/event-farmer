# 🗺️ Roadmap MVP - TeamSync

## Status Atual vs MVP Must-have

### 📊 Visão Geral

| Categoria | Implementado | Parcial | Não Implementado | Progresso |
|-----------|--------------|---------|------------------|-----------|
| **Empresa (MVP)** | 3/8 | 2/8 | 3/8 | 37.5% |
| **Fornecedor (MVP)** | 2/6 | 1/6 | 3/6 | 33.3% |
| **Core Platform** | 5/5 | 0/5 | 0/5 | 100% |

---

## 🎯 Fase 1: Core MVP (Crítico) - Próximas 4-6 semanas

### Prioridade P0 (Bloqueador)

#### 1. Sistema de RFQ (Request for Quote) ⏳
**Status**: ❌ Não implementado  
**Complexidade**: Alta  
**Tempo estimado**: 2-3 semanas

**Backend:**
- [ ] Modelo `RFQ` (Request for Quote)
- [ ] Endpoint `POST /rfq` (empresa cria RFQ)
- [ ] Endpoint `GET /rfq/fornecedor/{id}` (fornecedor vê RFQs)
- [ ] Endpoint `POST /rfq/{id}/proposta` (fornecedor responde)
- [ ] Endpoint `GET /rfq/{id}/propostas` (empresa vê propostas)

**Frontend:**
- [ ] Formulário de Brief estruturado (3-5 min)
- [ ] Página "Enviar RFQ" com brief preenchido
- [ ] Dashboard fornecedor: Lista de RFQs recebidos
- [ ] Formulário de resposta/proposta (fornecedor)
- [ ] Notificações quando RFQ recebido

**Dependências:**
- Brief estruturado (pessoas, data, localização, budget, objetivo)

---

#### 2. Comparação de Propostas ⏳
**Status**: ❌ Não implementado  
**Complexidade**: Média  
**Tempo estimado**: 1 semana

**Backend:**
- [ ] Endpoint `GET /rfq/{id}/propostas` (já mencionado acima)
- [ ] Schema `PropostaResponse` com campos comparáveis

**Frontend:**
- [ ] Página de comparação (2-4 propostas lado a lado)
- [ ] Cards de proposta com:
  - Preço total
  - O que inclui
  - Extras
  - Condições
  - Rating do fornecedor
- [ ] Botão "Selecionar" em cada proposta
- [ ] Visualização responsiva (mobile-friendly)

---

#### 3. Checkout com Pagamento ⏳
**Status**: ❌ Não implementado  
**Complexidade**: Alta  
**Tempo estimado**: 2-3 semanas

**Backend:**
- [ ] Integração gateway de pagamento (Stripe/PayPal)
- [ ] Modelo `Pagamento` (reserva_id, valor, método, estado)
- [ ] Endpoint `POST /reservas/{id}/checkout`
- [ ] Webhook para confirmação de pagamento
- [ ] Suporte a pagamento integral ou depósito

**Frontend:**
- [ ] Página de checkout
- [ ] Formulário de pagamento
- [ ] Confirmação de pagamento
- [ ] Redirecionamento após sucesso

**Dependências:**
- Gateway de pagamento configurado
- Conta de teste criada

---

#### 4. Página do Evento (Single Source of Truth) ⏳
**Status**: ⚠️ Parcial (existe detalhes básicos)  
**Complexidade**: Média  
**Tempo estimado**: 1-2 semanas

**Backend:**
- [ ] Endpoint `GET /eventos/{reserva_id}` (detalhes completos)
- [ ] Modelo `EventoDocumento` (upload de ficheiros)
- [ ] Modelo `EventoNota` (notas do evento)

**Frontend:**
- [ ] Página completa do evento com:
  - [x] Detalhes básicos (já existe)
  - [ ] Morada completa
  - [ ] Horário detalhado
  - [ ] Contactos (empresa + fornecedor)
  - [ ] Secção de mensagens (ver item 5)
  - [ ] Upload/download de ficheiros
  - [ ] Notas do evento
  - [ ] Checklist (para fornecedor)

---

### Prioridade P1 (Importante)

#### 5. Sistema de Mensagens ⏳
**Status**: ❌ Não implementado  
**Complexidade**: Alta  
**Tempo estimado**: 2 semanas

**Backend:**
- [ ] Modelo `Mensagem` (reserva_id, remetente, destinatário, conteúdo, data)
- [ ] Endpoint `GET /reservas/{id}/mensagens`
- [ ] Endpoint `POST /reservas/{id}/mensagens`
- [ ] WebSocket ou polling para mensagens em tempo real

**Frontend:**
- [ ] Componente de chat (tipo encomenda)
- [ ] Integração na página do evento
- [ ] Notificações de novas mensagens
- [ ] Histórico de mensagens

---

#### 6. Notificações por Email ⏳
**Status**: ❌ Não implementado  
**Complexidade**: Média  
**Tempo estimado**: 1 semana

**Backend:**
- [ ] Serviço de email (SendGrid/Mailgun/Resend)
- [ ] Templates de email:
  - RFQ recebido (fornecedor)
  - Proposta recebida (empresa)
  - Reserva confirmada
  - Pagamento recebido
  - Evento próximo
  - Lembrete pós-evento (avaliação)
- [ ] Queue de emails (Celery ou similar)

**Frontend:**
- [ ] Preferências de notificação (opcional)

---

## 🎯 Fase 2: Execução e Qualidade - Semanas 7-10

### Prioridade P1 (Importante)

#### 7. Execução do Evento (Fornecedor) ⏳
**Status**: ❌ Não implementado  
**Complexidade**: Média  
**Tempo estimado**: 1-2 semanas

**Backend:**
- [ ] Modelo `EventoChecklist` (itens, estado)
- [ ] Endpoint `GET /reservas/{id}/checklist`
- [ ] Endpoint `POST /reservas/{id}/checklist/item`
- [ ] Endpoint `PUT /reservas/{id}/checklist/item/{id}`

**Frontend:**
- [ ] Checklist interativo (fornecedor)
- [ ] Upload de documentos/fotos
- [ ] Notas do evento
- [ ] Contactos rápidos

---

#### 8. Onboarding Fornecedor Completo ⏳
**Status**: ⚠️ Parcial (existe registo básico)  
**Complexidade**: Média  
**Tempo estimado**: 1 semana

**Backend:**
- [ ] Campos adicionais no modelo `Fornecedor`:
  - [ ] NIF/NIPC
  - [ ] IBAN
  - [ ] Dados legais
  - [ ] Documentos (certificados, seguros)
- [ ] Endpoint `POST /fornecedores/verificar` (admin)
- [ ] Estado de verificação (pendente, aprovado, rejeitado)

**Frontend:**
- [ ] Formulário de onboarding completo
- [ ] Upload de documentos
- [ ] Dashboard de estado de verificação

---

### Prioridade P2 (Desejável)

#### 9. Disponibilidade Manual Assistida ⏳
**Status**: ❌ Não implementado  
**Complexidade**: Baixa-Média  
**Tempo estimado**: 1 semana

**Backend:**
- [ ] Modelo `Disponibilidade` (atividade_id, data, disponivel, capacidade)
- [ ] Endpoint `GET /atividades/{id}/disponibilidade`
- [ ] Endpoint `POST /atividades/{id}/disponibilidade`

**Frontend:**
- [ ] Calendário simples (fornecedor)
- [ ] Marcar datas disponíveis/indisponíveis
- [ ] Ou: "Confirmar por pedido" (mais simples no MVP)

---

#### 10. Pagamentos e Reconciliação ⏳
**Status**: ❌ Não implementado  
**Complexidade**: Alta  
**Tempo estimado**: 2 semanas

**Backend:**
- [ ] Modelo `Comissao` (reserva_id, valor_comissao, estado_payout)
- [ ] Endpoint `GET /fornecedores/{id}/comissoes`
- [ ] Endpoint `GET /fornecedores/{id}/payouts`
- [ ] Geração de faturas/recibos (PDF)

**Frontend:**
- [ ] Dashboard de comissões (fornecedor)
- [ ] Histórico de payouts
- [ ] Download de faturas/recibos

---

## 📈 Métricas de Sucesso

### North Star Metric
**"Eventos confirmados e realizados com sucesso por mês"**

### Métricas de Acompanhamento
- [ ] Taxa de conversão RFQ → Proposta
- [ ] Taxa de conversão Proposta → Reserva
- [ ] Taxa de conversão Reserva → Pagamento
- [ ] Taxa de conclusão de eventos
- [ ] NPS médio pós-evento
- [ ] Tempo médio de resposta do fornecedor (RFQ → Proposta)
- [ ] Taxa de cancelamento

---

## 🚀 Quick Wins (Implementar Primeiro)

1. **Brief estruturado** (1-2 dias)
   - Melhorar formulário de busca existente
   - Adicionar campo "objetivo" e "preferências"

2. **Notificações básicas por email** (2-3 dias)
   - Usar serviço simples (Resend/SendGrid)
   - Templates básicos

3. **Página do evento melhorada** (3-4 dias)
   - Adicionar secções faltantes
   - Melhorar layout

---

## 📝 Notas de Implementação

### Decisões Técnicas Pendentes
- [ ] Escolher gateway de pagamento (Stripe vs PayPal vs local)
- [ ] Escolher serviço de email (Resend vs SendGrid vs Mailgun)
- [ ] Decidir sobre WebSocket vs polling para mensagens
- [ ] Estrutura de armazenamento de ficheiros (S3 vs local)

### Dependências Externas
- [ ] Conta de gateway de pagamento
- [ ] Conta de serviço de email
- [ ] Storage para ficheiros (se usar cloud)

---

**Última atualização**: Dezembro 2024  
**Próxima revisão**: Após conclusão da Fase 1
