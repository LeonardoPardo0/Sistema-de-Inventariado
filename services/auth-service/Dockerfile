# Imagen base: Node.js 18 Alpine (ligera)
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer puerto 3000 (según documentación)
EXPOSE 3000

# Variables de entorno por defecto (se pueden sobrescribir con docker-compose)
ENV PORT=3000
ENV NODE_ENV=production

# Comando de inicio
CMD ["npm", "start"]