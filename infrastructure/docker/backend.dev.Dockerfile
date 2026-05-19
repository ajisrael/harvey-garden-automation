FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src
COPY test ./test

RUN mkdir -p /app/data

ENV NODE_ENV=test
ENV DB_PATH=/app/data/harvey.db

CMD ["npm", "test"]
