# TeamEvents - Plataforma de Eventos de Equipa

MVP de uma plataforma web para empresas organizarem eventos de equipa (team building, retiros, atividades de grupo).

## 🚀 Stack Tecnológico

- **Frontend:** React + Vite + TailwindCSS + React Router
- **Backend:** FastAPI (Python)
- **Base de dados:** PostgreSQL com SQLAlchemy
- **Autenticação:** JWT
- **Containerização:** Docker + docker-compose

## 📋 Pré-requisitos

- Docker e Docker Compose instalados

## 🏃 Como executar

1. Clone o repositório
2. Execute:
```bash
docker-compose up --build
```

3. Acesse:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - pgAdmin: http://localhost:5050

## 📁 Estrutura do Projeto

```
/backend
  /app
    /models
    /schemas
    /crud
    /routers
    /core
    database.py
    main.py
/frontend
  /src
    /components
    /pages
    /hooks
    /services
    App.jsx
    main.jsx
```

## 🔐 Credenciais Padrão

- **pgAdmin:** admin@teamevents.com / admin123
- **Database:** teamevents / teamevents123

**Para credenciais de usuários de teste (empresa, fornecedor, admin), veja [CREDENCIAIS.md](./CREDENCIAIS.md)**

## 🧪 Testes

Após iniciar a aplicação, você pode:
1. Criar uma conta de empresa ou fornecedor
2. Fazer login
3. Solicitar recomendações de atividades
4. Fazer reservas
5. Visualizar reservas

## 📝 Notas

- As migrações do Alembic serão executadas automaticamente
- O backend cria dados mock na primeira execução
- Para produção, altere as credenciais e SECRET_KEY

## 📚 Documentação

Para entender o estado atual completo do projeto, funcionalidades implementadas, arquitetura e próximos passos, consulte:

- **[ESTADO_PROJETO.md](./ESTADO_PROJETO.md)** - Estado atual completo do projeto (RECOMENDADO para novos desenvolvedores)
- [VISAO_PRODUTO.md](./VISAO_PRODUTO.md) - Visão de produto e MVP scope
- [ROADMAP_MVP.md](./ROADMAP_MVP.md) - Roadmap detalhado
- [FUNCIONALIDADES.md](./FUNCIONALIDADES.md) - Lista completa de funcionalidades
- [CREDENCIAIS.md](./CREDENCIAIS.md) - Credenciais de acesso
