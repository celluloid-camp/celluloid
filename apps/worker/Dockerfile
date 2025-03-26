FROM node:20-alpine AS base
ARG PNPM_VERSION=9.15.0
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS builder
# Set working directory
WORKDIR /app
RUN pnpm install -g turbo
COPY . .
RUN turbo prune --scope=worker --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
# RUN apk add --update --no-cache libc6-compat && rm -rf /var/cache/apk/*
# COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch
# ↑ By caching the content-addressable store we stop downloading the same packages again and again
# Build the project
COPY --from=builder /app/out/full/ .
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
  pnpm install --filter=worker... -r --workspace-root --frozen-lockfile --unsafe-perm

COPY --from=builder /app/out/full/ ./
COPY turbo.json turbo.json
RUN pnpm prisma generate && pnpm run build --filter=worker...

FROM installer AS pruned
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
  pnpm --filter=worker --prod deploy pruned --config.ignore-scripts=true


FROM base
WORKDIR /app

RUN apk add --no-cache bash openssl openssl-dev ffmpeg
COPY --from=installer /app/ ./

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

CMD ["node", "/app/apps/worker/dist/index.js"]
