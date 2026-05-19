FROM node:20-alpine

RUN apk add --no-cache python3 make g++ linux-headers

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV DB_PATH=/app/data/harvey.db

EXPOSE 5000

CMD ["node", "src/server.js"]
