#!/bin/bash

echo "🚀 Iniciando TeamEvents passo a passo..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Testar banco de dados primeiro
echo -e "${YELLOW}1. Testando banco de dados...${NC}"
docker compose up -d db

echo "Aguardando banco de dados..."
sleep 5

# Verificar se o banco está rodando
if docker ps | grep -q teamevents_db; then
    echo -e "${GREEN}✓ Banco de dados está rodando${NC}"
else
    echo -e "${YELLOW}✗ Problema com banco de dados${NC}"
    exit 1
fi

# 2. Build do backend
echo -e "${YELLOW}2. Construindo backend...${NC}"
docker compose build backend

# 3. Build do frontend
echo -e "${YELLOW}3. Construindo frontend (pode demorar alguns minutos)...${NC}"
docker compose build frontend

# 4. Iniciar todos os serviços
echo -e "${YELLOW}4. Iniciando todos os serviços...${NC}"
docker compose up

