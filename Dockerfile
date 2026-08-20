FROM node:22-bookworm-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY tsconfig.json ./
COPY src ./src
COPY public ./public

FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV DATA_DIR=/data

COPY --from=build /app /app

EXPOSE 3000

CMD ["./node_modules/.bin/tsx", "src/index.ts"]
