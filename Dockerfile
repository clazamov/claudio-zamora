FROM node:24-alpine AS build
WORKDIR /usr/app
RUN corepack enable
COPY . .
RUN test -f pnpm-lock.yaml && pnpm install --frozen-lockfile
RUN pnpm run build && test -f dist/main.js
RUN pnpm prune --prod

FROM node:24-alpine AS runtime
WORKDIR /usr/app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /usr/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/app/dist ./dist
COPY --from=build --chown=node:node /usr/app/package.json ./package.json
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
