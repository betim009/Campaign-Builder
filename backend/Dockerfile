FROM node:20-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY migrations ./migrations
COPY uploads ./uploads

EXPOSE 3001
CMD ["npm","run","start"]
