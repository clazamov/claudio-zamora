# Etapa 1: instalar dependencias y compilar
FROM node:24-alpine AS build

WORKDIR /usr/app
RUN corepack enable

COPY package*.json ./
COPY pnpm-workspace.yaml ./
# Si existe pnpm-lock.yaml, copiarlo aqui y usar --frozen-lockfile.
RUN pnpm install

# Excluir node_modules y dist mediante .dockerignore.
COPY . .

# Ejecutar pruebas unitarias y generar cobertura
RUN pnpm run test:cov --runInBand

# Compilar
RUN pnpm run build

# Eliminar dependencias de desarrollo
RUN pnpm prune --prod

# Etapa 2: ejecutar la aplicacion
FROM node:24-alpine AS runtime

WORKDIR /usr/app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /usr/app/package.json ./package.json
COPY --from=build --chown=node:node /usr/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/app/dist ./dist

USER node
EXPOSE 3000

# Confirmar la ruta de entrada con el resultado de pnpm run build.
CMD ["node", "dist/main.js"]
