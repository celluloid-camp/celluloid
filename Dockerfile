FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat ffmpeg
RUN npm install -g turbo pnpm

FROM base AS pruned
WORKDIR /app
COPY . .
RUN turbo prune --scope=frontend --docker

FROM base AS installer
WORKDIR /app

COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/pnpm-lock.yaml /app/pnpm-lock.yaml

RUN \
  --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=private \
  pnpm install --frozen-lockfile

FROM base as builder
WORKDIR /app
ARG COMMIT
ENV COMMIT=${COMMIT}

COPY --from=installer --link /app .
COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.json tsconfig.json

RUN turbo run build --no-cache

RUN \
  --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=private \
  pnpm install --frozen-lockfile

FROM base AS runner
WORKDIR /app
RUN apk add --no-cache ffmpeg curl

COPY --from=builder /app .

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["sh", "-c", "pnpm prisma migrate:deploy & pnpm frontend start"]
