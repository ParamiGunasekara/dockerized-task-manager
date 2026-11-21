
# Stage 1: Install production dependencies
FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Stage 2: Run application
FROM node:24-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY package*.json ./

COPY server.js db.js ./

EXPOSE 3000

USER node

CMD ["node", "server.js"]
