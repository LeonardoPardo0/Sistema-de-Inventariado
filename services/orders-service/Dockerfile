FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3003

# Comando de inicio
CMD ["node", "src/index.js"]