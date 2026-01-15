# 🎯 Visão de Produto - TeamSync

## Visão (1 frase)

**A TeamSync é o "copiloto" de eventos de equipa: em minutos, transforma um objetivo de cultura/engagement num evento reservado, confirmado e executável — com zero caos operacional.**

---

## North Star Metric (NSM)

**"Eventos confirmados e realizados com sucesso por mês"**

### Definição prática
Bookings pagos que aconteceram (não cancelados) e tiveram "sucesso":
- NPS ≥ 8 ou avaliação ≥ 4/5
- Sem incidentes críticos

### Porquê este NSM?
Este métrica força o produto a otimizar:
- **Valor real** (não só leads)
- **Qualidade** (execução)
- **Liquidez do marketplace** (oferta a responder + conversão)

---

## Escopo do MVP

### MVP — Empresa (B2B Buyer)

**Objetivo do MVP:** Fazer uma empresa conseguir descobrir → pedir proposta → reservar → pagar → ter confirmação sem fricção.

#### ✅ Must-have

1. **Brief rápido (3–5 min)**
   - Pessoas, data(s), localização / raio, budget
   - Objetivo (ex.: bonding, onboarding, celebração)
   - Preferências/restrições

2. **Catálogo "curado" + pesquisa/filtros básicos**
   - Categorias, preço por pessoa, duração
   - Indoor/outdoor, distância, disponibilidade "aproximada"

3. **Pedido de proposta / disponibilidade (RFQ leve)**
   - 1 clique para pedir confirmação com o brief já preenchido

4. **Comparação simples de opções**
   - 2–4 propostas lado a lado
   - Preço total, o que inclui, extras, condições

5. **Reserva + pagamento (checkout)**
   - Pagamento integral ou depósito
   - Protege margem e reduz no-shows

6. **Página do evento (single source of truth)**
   - Detalhes, morada, horário, contactos
   - Notas, ficheiros, mensagens

7. **Mensagens e notificações**
   - Chat "tipo encomenda" com fornecedor
   - Updates por email

8. **Avaliação pós-evento (rápida)**
   - Rating + 1 pergunta NPS + "o que melhorar"

#### ⚠️ Nice-to-have (não MVP)

- Aprovações internas multi-nível
- Split billing / faturas por centro de custo
- Automação de convites a participantes
- Calendar sync, integrações HRIS
- Programas multi-evento e contratos anuais

#### ❌ Fora do MVP (de propósito)

- "IA" de matching avançada (começa rules-based)
- Marketplace self-serve completo com preços dinâmicos
- Subscrições SaaS e dashboards avançados
- Multi-país / multi-idioma / multi-moeda (só preparar bases)

---

### MVP — Fornecedor (Supply)

**Objetivo do MVP:** Tornar o fornecedor reservável e confiável, com resposta rápida e execução clara.

#### ✅ Must-have

1. **Onboarding simples + verificação básica**
   - Dados legais, IBAN, contactos
   - Áreas de serviço, termos, documentos

2. **Criar/listar atividades (1–5 no início)**
   - Descrição, duração, capacidade min/max
   - Preço base, o que inclui, extras, requisitos

3. **Gestão de pedidos**
   - Receber RFQ, aceitar/recusar
   - Enviar proposta (template) e condições

4. **Disponibilidade "manual assistida"**
   - No MVP, pode ser calendário simples ou "confirmar por pedido"

5. **Execução**
   - Checklist do evento + contactos + notas
   - Upload de documentos

6. **Pagamentos e reconciliação**
   - Ver reservas, comissões, payouts
   - Faturas/recibos (mesmo que parcialmente manual no backoffice)

#### ⚠️ Nice-to-have (não MVP)

- Integração com calendários (Google/Outlook)
- Gestão de equipa/monitores
- Add-ons avançados e bundles
- Preços por época / yield management

#### ❌ Fora do MVP

- Portal completo de performance (analytics detalhado)
- Automação de marketing para fornecedores
- SLA scoring algorítmico público

---

## Status de Implementação

### ✅ Implementado

#### Empresa
- ✅ Catálogo com pesquisa e filtros básicos
- ✅ Visualização de atividades (detalhes, preço, capacidade)
- ✅ Sistema de avaliações pós-evento
- ✅ Reservas sem conta (guest checkout)
- ✅ Reservas com conta autenticada

#### Fornecedor
- ✅ Onboarding básico (registo)
- ✅ Criar/listar atividades
- ✅ Gestão de reservas (aceitar/recusar)
- ✅ Dashboard com estatísticas

#### Admin
- ✅ Aprovação de atividades
- ✅ Dashboard e relatórios básicos

### ⚠️ Parcialmente Implementado

#### Empresa
- ⚠️ Brief rápido (existe busca com filtros, mas não brief estruturado)
- ⚠️ Página do evento (existe detalhes, mas não é "single source of truth" completo)

#### Fornecedor
- ⚠️ Onboarding (falta verificação básica e dados legais/IBAN)

### ❌ Não Implementado (MVP Must-have)

#### Empresa
- ❌ Pedido de proposta / disponibilidade (RFQ)
- ❌ Comparação simples de opções (2-4 propostas lado a lado)
- ❌ Pagamento (checkout com pagamento integral/depósito)
- ❌ Página do evento completa (single source of truth com mensagens, ficheiros)
- ❌ Mensagens e notificações (chat com fornecedor + emails)

#### Fornecedor
- ❌ Onboarding completo (dados legais, IBAN, verificação)
- ❌ Gestão de pedidos (RFQ) - receber, responder com proposta
- ❌ Disponibilidade manual assistida (calendário ou confirmação por pedido)
- ❌ Execução (checklist do evento, contactos, notas, upload documentos)
- ❌ Pagamentos e reconciliação (ver comissões, payouts, faturas)

---

## Próximos Passos Prioritários

### Fase 1: Core MVP (Crítico)
1. **Sistema de RFQ (Request for Quote)**
   - Empresa: Brief estruturado → Enviar RFQ
   - Fornecedor: Receber RFQ → Responder com proposta

2. **Comparação de Propostas**
   - Visualização lado a lado de 2-4 propostas
   - Decisão e reserva

3. **Checkout com Pagamento**
   - Integração gateway de pagamento
   - Pagamento integral ou depósito

4. **Página do Evento (Single Source of Truth)**
   - Detalhes completos, contactos, horários
   - Mensagens, ficheiros, notas

### Fase 2: Execução e Qualidade
5. **Sistema de Mensagens**
   - Chat entre empresa e fornecedor
   - Notificações por email

6. **Execução (Fornecedor)**
   - Checklist do evento
   - Upload de documentos/fotos
   - Notas e contactos

7. **Onboarding Fornecedor Completo**
   - Dados legais, IBAN
   - Verificação básica
   - Documentos

### Fase 3: Disponibilidade e Gestão
8. **Disponibilidade Manual Assistida**
   - Calendário simples ou confirmação por pedido

9. **Pagamentos e Reconciliação**
   - Dashboard de comissões
   - Payouts e faturas

---

## Notas de Design

### Princípios
- **Zero fricção**: Reduzir passos desnecessários
- **Transparência**: Tudo visível e claro
- **Confiança**: Verificação e qualidade
- **Simplicidade**: MVP focado no essencial

### Fluxo Ideal (Empresa)
1. Brief rápido (3-5 min) → 2. Ver catálogo filtrado → 3. Enviar RFQ → 4. Receber propostas → 5. Comparar → 6. Reservar + Pagar → 7. Gerir evento → 8. Avaliar

### Fluxo Ideal (Fornecedor)
1. Onboarding + Verificação → 2. Criar atividades → 3. Receber RFQ → 4. Responder proposta → 5. Confirmar reserva → 6. Executar evento → 7. Receber pagamento

---

**Última atualização**: Dezembro 2024
**Versão**: MVP v1.0 (em desenvolvimento)
