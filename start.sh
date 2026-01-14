#!/bin/bash

echo "🚀 Iniciando TeamEvents..."
echo ""

# Limpar containers antigos (opcional)
echo "🧹 Limpando containers antigos..."
docker compose down 2>/dev/null

# Build e start com logs
echo "📦 Construindo imagens..."
docker compose build --progress=plain

echo ""
echo "▶️  Iniciando serviços..."
docker compose up

