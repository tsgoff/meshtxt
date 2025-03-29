FROM node:alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install -g npm@latest && npm ci

COPY . .
RUN npm run build

FROM node:alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/server.js ./

EXPOSE 8080

ENV API_URL=""

CMD ["sh", "-c", "node server.js --port 8080 ${API_URL:+--meshtastic-api-url $API_URL}"]
