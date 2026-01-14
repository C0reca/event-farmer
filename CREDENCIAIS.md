# 🔐 Credenciais de Acesso - TeamEvents

## Usuários de Teste

### 👤 Empresa
- **Email:** `empresa@example.com`
- **Password:** `empresa123`
- **Acesso:** Dashboard de empresas, reservas, perfil

### 🏢 Fornecedor
- **Email:** `fornecedor@example.com`
- **Password:** `fornecedor123`
- **Acesso:** Painel do fornecedor, gestão de atividades e reservas

### 🔧 Admin
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Acesso:** Painel administrativo, aprovação de atividades, relatórios

## Como Fazer Login

1. Acesse: http://localhost:5173/login
2. Digite o email e password de um dos usuários acima
3. O sistema redirecionará automaticamente para:
   - **Empresa** → `/dashboard`
   - **Fornecedor** → `/fornecedor`
   - **Admin** → `/admin`

## Funcionalidades por Tipo de Usuário

### Empresa
- ✅ Visualizar atividades recomendadas
- ✅ Filtrar atividades por critérios
- ✅ Reservar atividades
- ✅ Ver reservas realizadas
- ✅ Gerir perfil da empresa

### Fornecedor
- ✅ Criar novas atividades
- ✅ Ver atividades criadas
- ✅ Gerir reservas recebidas (aceitar/recusar)
- ✅ Visualizar estatísticas

### Admin
- ✅ Dashboard com métricas gerais
- ✅ Aprovar/Rejeitar atividades pendentes
- ✅ Ver relatórios detalhados
- ✅ Top atividades e fornecedores

---

**Nota:** Estas são credenciais de desenvolvimento/teste. Em produção, use senhas fortes e implemente políticas de segurança adequadas.

