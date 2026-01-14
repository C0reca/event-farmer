FROM node:18-alpine

WORKDIR /app

# Copiar apenas package.json primeiro
COPY package.json ./

# Instalar dependências
RUN npm install

# Copiar resto dos arquivos
COPY . .

# Expor porta
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

