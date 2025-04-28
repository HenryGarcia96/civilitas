# Etapa 1: Construcción
FROM node:20-slim AS builder

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del proyecto y construimos
COPY . .
RUN npm run build

# Etapa 2: Imagen de producción
FROM node:20-slim

WORKDIR /app

# Copiamos solo node_modules y dist de la etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expone el puerto
EXPOSE 3000

# Ejecuta la app
CMD ["node", "dist/main"]
