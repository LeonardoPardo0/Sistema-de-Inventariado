# ==========================
# Etapa 1: Build
# ==========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia e instala dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copia el resto del código fuente
COPY . .

# ==========================
# Etapa 2: Runtime
# ==========================
FROM node:20-alpine

# Crear usuario seguro
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copia la app construida desde la etapa anterior
COPY --from=builder /app .

# 🔹 Evita error si 'public' no existe
RUN mkdir -p public

EXPOSE 3001

USER appuser

CMD ["npm", "run", "docker-start"]
