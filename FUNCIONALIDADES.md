# 📋 Funcionalidades da Aplicação TeamSync

Este documento lista todas as funcionalidades implementadas na plataforma TeamSync até o momento.

> **Nota**: Para a visão de produto, North Star Metric e escopo completo do MVP, consulte [VISAO_PRODUTO.md](./VISAO_PRODUTO.md)

---

## 🔐 Autenticação e Autorização

### Funcionalidades Gerais
- ✅ **Registo de utilizadores** com diferentes tipos:
  - Empresa (cliente)
  - Fornecedor (parceiro)
  - Admin (administrador)
- ✅ **Login** com email e password
- ✅ **Autenticação JWT** (JSON Web Tokens)
- ✅ **Proteção de rotas** baseada no tipo de utilizador
- ✅ **Sessão persistente** (localStorage)
- ✅ **Logout** com limpeza de dados de sessão
- ✅ **Obter informações do utilizador atual** (`/auth/me`)

### Fluxo de Registo
- Formulário diferenciado para Empresa vs Fornecedor
- Criação automática de perfil após registo
- Login automático após registo bem-sucedido

---

## 🏢 Funcionalidades para Empresas (Clientes)

### Dashboard
- ✅ **Visualização de atividades recomendadas** baseadas em critérios
- ✅ **Busca e filtros** de atividades:
  - Número de pessoas
  - Orçamento máximo
  - Localização
  - Tipo de empresa
  - Categoria de atividade
  - Clima (indoor/outdoor)
  - Duração máxima
- ✅ **Carregamento automático** de atividades ao entrar (padrão: 10 pessoas)
- ✅ **Visualização em cards** com informações principais
- ✅ **Acesso rápido a detalhes** de cada atividade

### Gestão de Atividades
- ✅ **Listar todas as atividades** disponíveis
- ✅ **Visualizar detalhes** de uma atividade específica:
  - Nome, descrição, tipo, categoria
  - Preço por pessoa
  - Capacidade máxima
  - Localização
  - Duração
  - Imagens
  - Clima (indoor/outdoor)
  - Rating médio e número de avaliações
  - Informações do fornecedor
- ✅ **Sistema de recomendações inteligente** baseado em:
  - Capacidade da atividade vs número de pessoas
  - Orçamento disponível
  - Localização preferida
  - Categoria de atividade
  - Clima preferido
  - Duração máxima
  - Ordenação por rating médio e preço

### Gestão de Reservas
- ✅ **Criar nova reserva** de atividade:
  - Seleção de atividade
  - Data da atividade
  - Número de pessoas
  - Cálculo automático do preço total
  - Validação de capacidade
- ✅ **Listar todas as reservas** da empresa:
  - Informações da atividade
  - Data da reserva
  - Número de pessoas
  - Preço total
  - Estado (pendente, confirmada, recusada)
  - Data de criação
- ✅ **Cancelar reservas** (apenas pendentes)
- ✅ **Visualizar histórico** de reservas

### Perfil da Empresa
- ✅ **Visualizar perfil** da empresa:
  - Nome
  - Setor
  - Número de funcionários
  - Localização
  - Orçamento médio anual
  - Preferências de atividades
- ✅ **Editar perfil** da empresa
- ✅ **Atualizar informações** para melhorar recomendações

### Avaliações
- ✅ **Criar avaliação** de atividade:
  - Rating (1-5 estrelas)
  - Comentário opcional
- ✅ **Listar avaliações** feitas pela empresa
- ✅ **Visualizar avaliações** de uma atividade específica

### Itinerários
- ✅ **Gerar itinerário** personalizado:
  - Data de início
  - Data de fim
  - Atividades selecionadas
  - Informações adicionais (JSON)
- ✅ **Listar itinerários** da empresa
- ✅ **Visualizar detalhes** de itinerários

---

## 🏪 Funcionalidades para Fornecedores

### Dashboard
- ✅ **Visualizar estatísticas**:
  - Número de atividades listadas
  - Reservas pendentes
  - Reservas confirmadas
- ✅ **Acesso rápido** a atividades e reservas

### Gestão de Atividades
- ✅ **Listar atividades** do fornecedor
- ✅ **Criar nova atividade**:
  - Nome
  - Tipo
  - Categoria
  - Preço por pessoa
  - Capacidade máxima
  - Localização
  - Descrição
  - Imagens (URLs)
  - Clima (indoor/outdoor/ambos)
  - Duração em minutos
- ✅ **Editar atividades** existentes
- ✅ **Visualizar estado** de aprovação (pendente/aprovada/rejeitada)
- ✅ **Aguardar aprovação** do admin antes de publicação

### Gestão de Reservas
- ✅ **Listar todas as reservas** das atividades do fornecedor:
  - Informações da empresa cliente
  - Atividade reservada
  - Data da reserva
  - Número de pessoas
  - Preço total
  - Estado (pendente, confirmada, recusada)
- ✅ **Aceitar reservas** pendentes
- ✅ **Recusar reservas** pendentes
- ✅ **Visualizar histórico** de reservas

### Perfil do Fornecedor
- ✅ **Visualizar perfil**:
  - Nome
  - Localização
  - Descrição
  - Contacto
- ✅ **Editar perfil** do fornecedor
- ✅ **Atualizar informações** de contacto

---

## 👨‍💼 Funcionalidades para Administradores

### Dashboard Administrativo
- ✅ **Métricas gerais**:
  - Número total de empresas
  - Número total de fornecedores
  - Número total de atividades
  - Atividades aprovadas vs pendentes
  - Número total de reservas
  - Reservas pendentes vs confirmadas
  - Faturação total (reservas confirmadas)

### Gestão de Atividades
- ✅ **Listar atividades pendentes** de aprovação
- ✅ **Aprovar atividades** submetidas por fornecedores
- ✅ **Rejeitar atividades** que não cumprem critérios
- ✅ **Visualizar detalhes** completos de atividades pendentes

### Relatórios e Analytics
- ✅ **Relatórios dos últimos 30 dias**:
  - Número de reservas
  - Faturação total
  - Top 5 atividades mais reservadas
  - Top 5 fornecedores (por reservas e faturação)
- ✅ **Métricas de performance** da plataforma

---

## 🌐 Landing Page (Página Pública)

### Seções Implementadas
- ✅ **Hero Section**:
  - Headline e subheadline
  - CTAs principais (Criar conta / Agendar demo)
  - Design moderno com gradientes

- ✅ **O Problema**:
  - Explicação dos desafios que a plataforma resolve
  - Background com gradiente

- ✅ **A Solução**:
  - Apresentação da TeamSync como solução
  - Background branco

- ✅ **Como Funciona** (4 passos):
  - Define o teu evento
  - Recebe sugestões
  - Reserva com confiança
  - Executa sem stress

- ✅ **Experiências em Destaque**:
  - Grid de 6 atividades em destaque
  - Cards com imagem, categoria, descrição, localização, duração, capacidade e preço
  - Integração com API (com fallback para dados mock)
  - Loading states com skeletons
  - CTA para explorar todas as experiências

- ✅ **Nossos Parceiros / Fornecedores**:
  - Grid de fornecedores verificados
  - Integração com API (com fallback para dados mock)
  - Loading states
  - CTA para tornar-se parceiro

- ✅ **Tipos de Experiências**:
  - Cards com diferentes categorias de atividades
  - Background dark navy

- ✅ **Para Quem É**:
  - Seções para empresas e fornecedores
  - Benefícios específicos para cada público

- ✅ **Porquê TeamSync**:
  - Diferenciais da plataforma
  - Background branco

- ✅ **Confiança & Qualidade**:
  - Elementos de confiança e segurança
  - Background com gradiente

- ✅ **CTA Final**:
  - Chamada para ação principal
  - Background primary

- ✅ **Footer**:
  - Links rápidos
  - Informações de contacto
  - Links legais
  - Copyright

### Características Técnicas
- ✅ **Design System TeamSync**:
  - Cores: Primary (azul), Accent (coral), Navy, Grey
  - Tipografia: Inter (Google Fonts)
  - Componentes reutilizáveis
  - Responsive design
  - Acessibilidade (WCAG AA/AAA)

- ✅ **Integração com Backend**:
  - Busca de atividades reais
  - Busca de fornecedores reais
  - Fallback para dados mock quando API não disponível

---

## 🎨 Componentes de UI

### Componentes Base
- ✅ **Button** com múltiplas variantes (primary, outline, ghost, accent, etc.)
- ✅ **Card** com hover effects e padding customizável
- ✅ **Input** com estados de focus e disabled
- ✅ **Textarea** para textos longos
- ✅ **Select** para dropdowns
- ✅ **Label** para formulários
- ✅ **Badge** para tags e categorias
- ✅ **StatCard** para métricas e KPIs

### Componentes de Layout
- ✅ **Navbar** com navegação condicional por tipo de utilizador
- ✅ **AppLayout** para páginas autenticadas
- ✅ **AppSidebar** com navegação lateral (desktop)
- ✅ **Toast** para notificações

### Componentes de Domínio
- ✅ **ActivityCard** para exibir atividades:
  - Imagem de destaque
  - Badge de categoria
  - Rating com estrelas
  - Informações principais
  - Botões de ação (Detalhes, Reservar)
- ✅ **ReservationForm** para criar reservas
- ✅ **DashboardStats** para métricas

---

## 🔧 Funcionalidades Técnicas

### Backend (FastAPI)
- ✅ **API RESTful** completa
- ✅ **Autenticação JWT** com expiração configurável
- ✅ **Validação de dados** com Pydantic schemas
- ✅ **Base de dados PostgreSQL** com SQLAlchemy ORM
- ✅ **Migrações Alembic** automáticas
- ✅ **CORS configurado** para desenvolvimento
- ✅ **Dados mock** criados automaticamente na primeira execução
- ✅ **Interceptors** para tratamento de erros de autenticação
- ✅ **Validação de permissões** por tipo de utilizador

### Frontend (React + Vite)
- ✅ **React Router** para navegação
- ✅ **Context API** para gestão de estado de autenticação
- ✅ **Axios** para chamadas HTTP
- ✅ **React Toastify** para notificações
- ✅ **Tailwind CSS** para estilização
- ✅ **Design System** consistente
- ✅ **Responsive design** (mobile-first)
- ✅ **Loading states** em todas as operações assíncronas
- ✅ **Error handling** com mensagens amigáveis
- ✅ **Form validation** client-side

### Base de Dados
- ✅ **Modelos implementados**:
  - User (utilizadores)
  - Empresa (perfis de empresas)
  - Fornecedor (perfis de fornecedores)
  - Atividade (atividades/experiências)
  - Reserva (reservas de atividades)
  - Avaliacao (avaliações de atividades)
  - Itinerario (itinerários de empresas)
- ✅ **Relacionamentos** entre modelos
- ✅ **Enums** para estados (Reserva, Atividade)
- ✅ **Campos calculados** (rating_medio, total_avaliacoes)

---

## 📊 Estados e Fluxos

### Estados de Atividade
- ✅ **Pendente**: Aguardando aprovação do admin
- ✅ **Aprovada**: Disponível para reservas
- ✅ **Rejeitada**: Não aprovada pelo admin

### Estados de Reserva
- ✅ **Pendente**: Aguardando confirmação do fornecedor
- ✅ **Confirmada**: Aceite pelo fornecedor
- ✅ **Recusada**: Rejeitada pelo fornecedor
- ✅ **Cancelada**: Cancelada pela empresa

### Fluxos Principais

#### Fluxo de Empresa
1. Registo → Login → Dashboard
2. Buscar atividades → Ver detalhes → Criar reserva
3. Visualizar reservas → Cancelar (se pendente)
4. Avaliar atividade após participação
5. Gerar itinerário para eventos multi-atividade

#### Fluxo de Fornecedor
1. Registo → Login → Dashboard
2. Criar atividade → Aguardar aprovação
3. Visualizar reservas → Aceitar/Recusar
4. Gerir perfil e atividades

#### Fluxo de Admin
1. Login → Dashboard
2. Visualizar atividades pendentes
3. Aprovar/Rejeitar atividades
4. Consultar relatórios e métricas

---

## 🚀 Funcionalidades de Deploy e DevOps

- ✅ **Docker Compose** para orquestração
- ✅ **Containerização** do frontend e backend
- ✅ **PostgreSQL** em container
- ✅ **pgAdmin** para gestão de base de dados
- ✅ **Scripts de inicialização** (start.sh, start-step-by-step.sh)
- ✅ **Variáveis de ambiente** configuráveis
- ✅ **Hot reload** em desenvolvimento

---

## 📝 Notas Importantes

### Status vs MVP

**Funcionalidades MVP Must-have ainda não implementadas:**
- ❌ Sistema de RFQ (Request for Quote) - pedido de proposta
- ❌ Comparação de propostas lado a lado
- ❌ Sistema de pagamento (checkout com gateway)
- ❌ Página do evento completa (single source of truth)
- ❌ Sistema de mensagens/chat entre empresa e fornecedor
- ❌ Notificações por email
- ❌ Onboarding completo do fornecedor (dados legais, IBAN, verificação)
- ❌ Gestão de disponibilidade (calendário ou confirmação por pedido)
- ❌ Execução do evento (checklist, upload documentos, notas)
- ❌ Pagamentos e reconciliação (comissões, payouts, faturas)

**Ver [VISAO_PRODUTO.md](./VISAO_PRODUTO.md) para detalhes completos do escopo do MVP.**

### Limitações Conhecidas
- ⚠️ Sistema de pagamento ainda não implementado (apenas cálculo de preços)
- ⚠️ Upload de imagens ainda não implementado (apenas URLs)
- ⚠️ Notificações em tempo real ainda não implementadas
- ⚠️ Sistema de mensagens entre empresa e fornecedor ainda não implementado
- ⚠️ Filtros avançados na busca de atividades podem ser expandidos
- ⚠️ Brief estruturado não implementado (existe busca com filtros básicos)
- ⚠️ RFQ (Request for Quote) não implementado

### Melhorias Futuras Sugeridas (Prioritárias para MVP)
- 🔄 **Crítico**: Sistema de RFQ e propostas
- 🔄 **Crítico**: Integração com gateway de pagamento
- 🔄 **Crítico**: Sistema de mensagens/chat
- 🔄 **Crítico**: Página do evento completa (single source of truth)
- 🔄 Sistema de upload de imagens
- 🔄 Notificações push/email
- 🔄 Sistema de favoritos
- 🔄 Compartilhamento de atividades
- 🔄 Calendário integrado
- 🔄 Exportação de relatórios (PDF/Excel)
- 🔄 Sistema de cupons/descontos
- 🔄 Programa de fidelidade

---

## 📚 Documentação Adicional

- **README.md**: Instruções de instalação e execução
- **CREDENCIAIS.md**: Credenciais de teste
- **TROUBLESHOOTING.md**: Soluções para problemas comuns
- **FRONTEND_MELHORIAS.md**: Melhorias implementadas no frontend
- **MELHORIAS_IMPLEMENTADAS.md**: Histórico de melhorias
- **DESIGN_SYSTEM.md**: Especificações do design system
- **CONTRASTE_RESUMO.md**: Verificação de contraste de cores (WCAG)

---

**Última atualização**: Dezembro 2024
**Versão da aplicação**: 1.0.0 (MVP)
