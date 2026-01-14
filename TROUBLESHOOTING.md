# Troubleshooting - Docker Compose

Se o `docker compose up --build` fica travado sem mostrar nada, tente estas soluções:

## 1. Verificar se o Docker está rodando

```bash
docker ps
```

## 2. Testar passo a passo

### Primeiro, testar apenas o banco de dados:

```bash
docker compose up db
```

Se funcionar, pressione Ctrl+C e continue.

### Depois, build das imagens separadamente:

```bash
# Build do backend
docker compose build backend

# Build do frontend  
docker compose build frontend
```

### Finalmente, iniciar tudo:

```bash
docker compose up
```

## 3. Limpar e recomeçar

```bash
# Parar tudo
docker compose down

# Remover volumes antigos (cuidado: apaga dados!)
docker compose down -v

# Limpar cache do Docker
docker system prune -a

# Tentar novamente
docker compose up --build
```

## 4. Executar com mais verbosidade

```bash
docker compose up --build --progress=plain
```

## 5. Verificar logs durante o build

Em outro terminal:

```bash
docker compose logs -f
```

## 6. Executar serviços localmente (alternativa)

Se o Docker continuar problemático, você pode executar localmente:

### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Banco de dados:
```bash
docker compose up db
```

## Problemas comuns:

- **"npm install" demora muito**: Normal, pode levar vários minutos na primeira vez
- **Erro de permissão**: Execute com `sudo` (Linux) ou verifique permissões do Docker
- **Porta já em uso**: Verifique se as portas 8000, 5173, 5432, 5050 estão livres

