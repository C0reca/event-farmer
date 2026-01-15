# 📋 Estado Atual do Projeto TeamSync

**Última atualização:** Dezembro 2024

## 🎯 Visão Geral

**TeamSync** é uma plataforma B2B para organização de eventos de equipa (team building, offsites, atividades corporativas). Funciona como um marketplace entre empresas (clientes) e fornecedores de atividades.

### Objetivo Principal
Permitir que empresas descubram, reservem e organizem experiências de equipa de forma simples e centralizada, sem necessidade de login inicial.

---

## 🛠️ Stack Tecnológica

### Backend
- **Framework:** FastAPI (Python 3.11)
- **ORM:** SQLAlchemy 2.0
- **Database:** PostgreSQL
- **Autenticação:** JWT (python-jose)
- **Validação:** Pydantic 2.5
- **Migrations:** Alembic
- **Email:** Serviço preparado (Resend/SendGrid/Mailgun - atualmente em modo log)

### Frontend
- **Framework:** React 18 + Vite
- **Roteamento:** React Router
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React
- **Notificações:** React Toastify
- **HTTP Client:** Axios

### DevOps
- **Containerização:** Docker + Docker Compose
- **Ambiente:** Desenvolvimento local com hot reload

---

## 📁 Estrutura do Projeto

```
event-farmer/
├── backend/
│   ├── app/
│   │   ├── core/           # Configurações, segurança, dependências
│   │   ├── crud/           # Operações de banco de dados
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── routers/        # Endpoints da API
│   │   ├── schemas/        # Schemas Pydantic
│   │   └── services/        # Serviços (email, payment gateway, proposta generator)
│   ├── alembic/            # Migrations
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── ui/         # Componentes base (Button, Card, Input, Loader)
│   │   │   └── layout/     # AppLayout
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks (useAuth)
│   │   └── services/       # API client
│   └── package.json
│
└── docker-compose.yml
```

---

## 🚀 Funcionalidades Implementadas

### 1. **Jornada Principal do Cliente (MVP)**

#### 1.1 Landing Page → Criar Evento
- **Rota:** `/`
- **Componente:** `LandingPage.jsx` + `CriarEventoForm.jsx`
- **Funcionalidade:**
  - Formulário completo para criar evento sem login
  - Campos: data início/fim, duração, nº pessoas, localização, tipos de atividades, almoço, transporte, expectativa de preço (€/€€/€€€)
  - Validação de campos obrigatórios
  - Conversão automática de tipos (string → int, string vazia → null)

#### 1.2 Geração de 3 Propostas Personalizadas
- **Backend:** `proposta_generator.py`
- **Endpoint:** `POST /eventos/criar`
- **Funcionalidade:**
  - Gera 3 propostas diferentes baseadas nos critérios:
    - **Proposta 1:** Aventura & Outdoor
    - **Proposta 2:** Criativa & Relax
    - **Proposta 3:** Híbrida / Corporate-friendly
  - Cada proposta inclui:
    - Agenda completa (manhã/almoço/tarde)
    - Atividades selecionadas baseadas em critérios
    - Preço total e por pessoa
    - O que está incluído
    - Notas importantes
  - IDs únicos dinâmicos: `prop_{evento_id}_{indice}` ou `prop_{uuid}`

#### 1.3 Visualização e Comparação de Propostas
- **Rota:** `/propostas-evento`
- **Componente:** `PropostasEvento.jsx`
- **Funcionalidade:**
  - Exibe 3 propostas lado a lado
  - Comparação rápida em tabela
  - Botões para editar ou dividir em grupos
  - Seleção de proposta para confirmação

#### 1.4 Edição em Tempo Real
- **Componente:** `EditarPropostaModal.jsx`
- **Funcionalidade:**
  - Editar atividades, horários, locais, preços
  - Adicionar/remover atividades da lista disponível
  - Adicionar/remover almoço e transporte
  - Cálculo automático do novo preço total
  - Validação de dados

#### 1.5 Divisão de Equipa em Grupos
- **Componente:** `DivisaoGruposModal.jsx`
- **Funcionalidade:**
  - Criar múltiplos grupos (Grupo A, B, C...)
  - Definir número de pessoas por grupo
  - Atribuir atividades específicas a cada grupo
  - Validação: total de pessoas deve corresponder ao evento
  - Cria reservas separadas para cada grupo

#### 1.6 Confirmação e Criação de Reservas
- **Rota:** `/checkout-evento`
- **Componente:** `CheckoutEvento.jsx`
- **Endpoint:** `POST /eventos/propostas/{proposta_id}/confirmar`
- **Funcionalidade:**
  - Resumo completo da proposta
  - Termos e condições
  - Se não autenticado: formulário para criar empresa temporária
  - Criação automática de reservas baseadas na proposta
  - Suporte para múltiplas reservas (quando dividido em grupos)
  - Redirecionamento para pagamento

#### 1.7 Pagamento
- **Rota:** `/checkout/{reserva_id}` ou `/reservas-multiplas`
- **Componente:** `Checkout.jsx` ou `ReservasMultiplas.jsx`
- **Funcionalidade:**
  - Integrado com sistema de pagamento existente
  - Suporte para pagamento único ou múltiplas reservas
  - Métodos: Cartão, MB Way (mock preparado para Stripe)

### 2. **Sistema de Autenticação**

- **Endpoints:**
  - `POST /auth/register` - Registo
  - `POST /auth/login` - Login
  - `GET /auth/me` - Informação do utilizador
- **Tipos de utilizador:**
  - `EMPRESA` - Clientes
  - `FORNECEDOR` - Fornecedores de atividades
  - `ADMIN` - Administradores
- **Autenticação opcional:** Endpoints podem funcionar com ou sem autenticação usando `get_current_user` (opcional) vs `get_current_user_required` (obrigatório)

### 3. **Sistema RFQ (Request for Quote)**

- **Funcionalidade:** Empresas criam pedidos de proposta, fornecedores respondem com propostas
- **Endpoints:**
  - `POST /rfq` - Criar RFQ
  - `GET /rfq` - Listar RFQs da empresa
  - `GET /rfq/{id}` - Detalhes do RFQ
  - `GET /rfq/disponiveis` - RFQs disponíveis para fornecedores
  - `POST /rfq/{id}/cancelar` - Cancelar RFQ
- **Notificações:** Email quando RFQ é criado

### 4. **Sistema de Propostas**

- **Endpoints:**
  - `POST /propostas` - Criar proposta (fornecedor)
  - `GET /propostas/rfq/{rfq_id}` - Propostas de um RFQ
  - `GET /propostas/minhas` - Propostas do fornecedor
  - `POST /propostas/{id}/aceitar` - Aceitar proposta (cria reserva automaticamente)
  - `POST /propostas/{id}/recusar` - Recusar proposta
- **Notificações:** Email quando nova proposta é criada ou aceite

### 5. **Gestão de Reservas**

- **Endpoints:**
  - `GET /reservas` - Listar reservas
  - `GET /reservas/{id}` - Detalhes da reserva
  - `POST /reservas` - Criar reserva (autenticado)
  - `POST /reservas/guest` - Criar reserva sem login (cria empresa temporária)
  - `POST /reservas/{id}/cancelar` - Cancelar reserva
- **Estados:** `PENDENTE`, `CONFIRMADA`, `CANCELADA`, `CONCLUIDA`

### 6. **Página de Evento (Single Source of Truth)**

- **Rota:** `/evento/{reserva_id}`
- **Componente:** `EventoDetail.jsx`
- **Funcionalidade:**
  - Centraliza todas as informações do evento
  - Mensagens entre empresa e fornecedor
  - Documentos (contratos, recibos, etc.)
  - Notas privadas do evento
  - Histórico de alterações

### 7. **Dashboard Empresa**

- **Rota:** `/dashboard`
- **Componente:** `Dashboard.jsx`
- **Funcionalidade:**
  - Próximos eventos
  - Sugestões de atividades
  - KPIs básicos
  - Botão para criar novo RFQ

### 8. **Dashboard Fornecedor**

- **Rota:** `/fornecedor`
- **Componente:** `Fornecedor.jsx`
- **Funcionalidade:**
  - Gestão de atividades
  - RFQs disponíveis
  - Propostas enviadas
  - Reservas confirmadas

---

## 🎨 Design System

### Cores (TeamSync Branding)
- **Primary:** Azul (`#2563EB`) - Confiança, tech
- **Accent:** Coral (`#F97360`) - Energia, cultura
- **Navy:** Tons escuros (`#0E1424` a `#1F2937`) - Texto principal
- **Grey:** Neutros (`#F3F4F6` a `#6B7280`) - Fundos e bordas
- **Status:** Success (verde), Warning (amarelo), Error (vermelho)

### Componentes UI Base
- **Button:** Variantes (primary, secondary, danger, outline, ghost), tamanhos (sm, md, lg)
- **Card:** Com sub-componentes (Header, Title, Description, Content, Footer)
- **Input:** Com sub-componentes (Select, Textarea), suporte a label, error, helperText
- **Loader:** Animação customizada com 3 barras (sm, md, lg)

### Tipografia
- **Fonte:** Inter (Google Fonts)
- **Hierarquia:** H1-H4 bem definidos, body text, small text

---

## 🔌 Endpoints Principais da API

### Eventos (Nova Jornada)
- `POST /eventos/criar` - Criar evento e gerar 3 propostas
- `POST /eventos/propostas/{proposta_id}/editar` - Editar proposta
- `POST /eventos/propostas/{proposta_id}/confirmar` - Confirmar proposta e criar reservas

### Autenticação
- `POST /auth/register` - Registo
- `POST /auth/login` - Login
- `GET /auth/me` - Utilizador atual

### RFQ
- `POST /rfq` - Criar RFQ
- `GET /rfq` - Listar RFQs da empresa
- `GET /rfq/{id}` - Detalhes do RFQ
- `GET /rfq/disponiveis` - RFQs para fornecedores

### Propostas
- `POST /propostas` - Criar proposta
- `GET /propostas/rfq/{rfq_id}` - Propostas de um RFQ
- `POST /propostas/{id}/aceitar` - Aceitar proposta

### Reservas
- `GET /reservas` - Listar reservas
- `POST /reservas` - Criar reserva
- `POST /reservas/guest` - Criar reserva sem login

### Pagamentos
- `POST /pagamentos` - Criar pagamento
- `POST /pagamentos/{id}/confirmar` - Confirmar pagamento

### Evento
- `GET /evento/{reserva_id}` - Dados completos do evento
- `POST /evento/{reserva_id}/mensagens` - Criar mensagem
- `POST /evento/{reserva_id}/documentos` - Upload documento
- `POST /evento/{reserva_id}/notas` - Criar nota privada

---

## 📊 Modelos de Dados Principais

### User
- `id`, `email`, `password_hash`, `nome`, `tipo` (EMPRESA, FORNECEDOR, ADMIN)

### Empresa
- `id`, `user_id`, `nome`, `localizacao`, `telefone`, `email`

### Fornecedor
- `id`, `user_id`, `nome`, `localizacao`, `telefone`, `email`, `estado` (PENDENTE, APROVADO, REJEITADO)

### Atividade
- `id`, `fornecedor_id`, `nome`, `descricao`, `categoria`, `tipo`, `localizacao`, `capacidade_min`, `capacidade_max`, `preco_por_pessoa`, `duracao_minutos`, `estado` (PENDENTE, APROVADA, REJEITADA)

### RFQ
- `id`, `empresa_id`, `data_evento`, `n_pessoas`, `localizacao`, `orcamento`, `objetivo`, `preferencias`, `estado` (ABERTO, FECHADO, CANCELADO)

### Proposta
- `id`, `rfq_id`, `fornecedor_id`, `atividade_id`, `preco_total`, `descricao`, `extras`, `condicoes`, `estado` (PENDENTE, ACEITE, REJEITADA), `reserva_id`

### Reserva
- `id`, `empresa_id`, `atividade_id`, `proposta_id`, `data`, `n_pessoas`, `preco_total`, `estado` (PENDENTE, CONFIRMADA, CANCELADA, CONCLUIDA)

### Pagamento
- `id`, `reserva_id`, `valor`, `metodo` (CARTAO, MBWAY), `estado` (PENDENTE, CONFIRMADO, FALHADO), `transaction_id`

### Mensagem
- `id`, `reserva_id`, `remetente_id`, `tipo_remetente` (EMPRESA, FORNECEDOR), `conteudo`, `data_envio`

### Documento
- `id`, `reserva_id`, `nome`, `tipo`, `url`, `uploaded_by_id`, `data_upload`

### NotaEvento
- `id`, `reserva_id`, `criado_por_id`, `tipo_criador` (EMPRESA, FORNECEDOR), `conteudo`, `privada`, `data_criacao`

---

## 🔄 Fluxos Principais

### Fluxo 1: Criar Evento (Sem Login)
1. Landing Page → Clicar "Criar Evento"
2. Preencher formulário (data, pessoas, localização, tipos, etc.)
3. Backend gera 3 propostas personalizadas
4. Visualizar e comparar propostas
5. (Opcional) Editar proposta
6. (Opcional) Dividir equipa em grupos
7. Escolher proposta → Checkout
8. Se não autenticado: preencher dados da empresa
9. Confirmar → Criar reservas
10. Pagar → Evento confirmado

### Fluxo 2: RFQ Tradicional
1. Empresa cria RFQ
2. Fornecedores veem RFQ disponível
3. Fornecedores criam propostas
4. Empresa compara propostas
5. Empresa aceita proposta → Reserva criada automaticamente
6. Checkout e pagamento

### Fluxo 3: Reserva Direta
1. Empresa/Visitante navega atividades
2. Seleciona atividade
3. Preenche formulário de reserva
4. (Se guest) Preenche dados da empresa
5. Reserva criada
6. Checkout e pagamento

---

## 🐛 Problemas Conhecidos e Soluções

### 1. Erro 422 (Unprocessable Entity)
**Causa:** Tipos incorretos enviados do frontend
**Solução:** 
- Frontend converte tipos antes de enviar (`n_pessoas`: string → int)
- Backend tem validadores Pydantic para aceitar strings e converter

### 2. Erro 403 (Forbidden)
**Causa:** Endpoint exigia autenticação obrigatória
**Solução:**
- Endpoint aceita `get_current_user` (opcional)
- Se não autenticado, cria empresa temporária com dados fornecidos

### 3. IDs de Propostas Fixos
**Causa:** Propostas usavam IDs fixos "A", "B", "C"
**Solução:**
- IDs dinâmicos gerados: `prop_{evento_id}_{indice}` ou `prop_{uuid}`
- Frontend mostra apenas o índice de forma amigável

---

## 📝 Notas de Implementação

### Validações Pydantic
- `EventoCreate` tem validadores para converter strings vazias em `None` e strings em `int`
- Campos opcionais aceitam `None` ou string vazia

### Autenticação Opcional
- `get_current_user`: Retorna `Optional[User]` (pode ser `None`)
- `get_current_user_required`: Exige autenticação, lança 401 se não autenticado
- Endpoints de eventos usam `get_current_user` para permitir uso sem login

### Criação de Empresa Temporária
- Se usuário não autenticado e fornece email/nome_empresa, sistema cria:
  - Usuário guest com tipo EMPRESA
  - Empresa associada
  - Permite criar reservas sem login completo

### Geração de Propostas
- Algoritmo busca atividades baseadas em:
  - Capacidade (deve suportar nº de pessoas)
  - Tipos selecionados (aventuras, artes, workshops, outdoor, indoor)
  - Localização (filtro básico)
- Cada proposta tem estilo diferente:
  - Aventura: foco em outdoor e atividades físicas
  - Criativa: foco em workshops e atividades indoor
  - Híbrida: mistura equilibrada

---

## 🚧 Próximos Passos / Melhorias Futuras

### Curto Prazo
- [ ] Salvar eventos e propostas no banco (atualmente só em memória)
- [ ] Validação de disponibilidade de atividades ao editar proposta
- [ ] Notificações por email quando reservas são criadas
- [ ] Upload de documentos no evento
- [ ] Sistema de avaliações pós-evento

### Médio Prazo
- [ ] Integração real com gateway de pagamento (Stripe/PayPal)
- [ ] Dashboard com métricas e analytics
- [ ] Sistema de recomendações mais inteligente
- [ ] Calendário de disponibilidade de fornecedores
- [ ] Chat em tempo real na página de evento

### Longo Prazo
- [ ] App mobile
- [ ] Integração com calendários (Google Calendar, Outlook)
- [ ] Sistema de fidelização e descontos
- [ ] Marketplace de fornecedores com reviews públicos
- [ ] API pública para integrações

---

## 🔧 Comandos Úteis

### Backend
```bash
# Iniciar servidor
cd backend
uvicorn app.main:app --reload

# Criar migration
alembic revision --autogenerate -m "descrição"
alembic upgrade head
```

### Frontend
```bash
# Instalar dependências
cd frontend
npm install

# Iniciar dev server
npm run dev
```

### Docker
```bash
# Iniciar tudo
docker-compose up

# Rebuild
docker-compose up --build

# Logs
docker-compose logs -f
```

---

## 📚 Arquivos de Documentação

- `README.md` - Documentação geral
- `VISAO_PRODUTO.md` - Visão de produto e MVP scope
- `ROADMAP_MVP.md` - Roadmap detalhado
- `FUNCIONALIDADES.md` - Lista completa de funcionalidades
- `DESIGN_SYSTEM.md` - Guia de design system
- `CREDENCIAIS.md` - Credenciais de acesso
- `ESTADO_PROJETO.md` - Este arquivo (estado atual)

---

## 🎯 Métricas de Sucesso (MVP)

- **North Star Metric:** Número de eventos confirmados e pagos
- **KPIs:**
  - Taxa de conversão: Landing → Propostas → Confirmação → Pagamento
  - Tempo médio desde criação até confirmação
  - Número de propostas geradas vs. aceites
  - Taxa de uso de edição de propostas
  - Taxa de divisão em grupos

---

## ⚠️ Avisos Importantes

1. **Email Service:** Atualmente em modo log (não envia emails reais). Configurar `EMAIL_ENABLED=true` e `RESEND_API_KEY` para produção.

2. **Payment Gateway:** Atualmente mockado. Preparado para integração com Stripe/PayPal.

3. **Upload de Arquivos:** Sistema de documentos preparado, mas upload real não implementado (apenas URLs).

4. **Validação de Disponibilidade:** Filtro básico implementado. Em produção, precisa de sistema mais robusto com calendário de fornecedores.

---

**Fim do documento.** Este arquivo deve ser atualizado sempre que houver mudanças significativas no projeto.
