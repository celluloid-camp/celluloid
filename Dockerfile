FROM node:20-alpine AS base
ARG PNPM_VERSION=9.15.0
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN apk add --no-cache libc6-compat bash openssl openssl-dev
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS builder
# Set working directory
WORKDIR /workspace
RUN pnpm install -g turbo
COPY . .
RUN turbo prune --scope=web --scope=worker --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /workspace
# RUN apk add --update --no-cache libc6-compat && rm -rf /var/cache/apk/*
ENV NEXT_TELEMETRY_DISABLED=1

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ENV SKIP_ENV_VALIDATIONS="true"

# COPY .gitignore .gitignore
COPY --from=builder /workspace/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch
# ↑ By caching the content-addressable store we stop downloading the same packages again and again


FROM installer AS web-builder
# Build the project
COPY --from=builder /workspace/out/full/ .
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
  pnpm install --filter=web... --filter=worker... -r --workspace-root --frozen-lockfile --unsafe-perm

# copy local cache
# COPY apps/web/.next ./apps/web/.next
COPY --from=builder /workspace/out/full/ ./
RUN pnpm prisma generate
RUN pnpm run build --filter=web...

FROM installer AS worker-builder
COPY --from=builder /workspace/out/full/ .
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
  pnpm install --filter=worker... -r --workspace-root --frozen-lockfile --unsafe-perm
RUN pnpm run build --filter=worker...


FROM base AS web
WORKDIR /workspace

# Install openssl in the runner stage
RUN apk add --no-cache curl bash openssl openssl-dev

ARG NEXT_PUBLIC_VERSION_TAG
ENV NEXT_PUBLIC_VERSION_TAG=${NEXT_PUBLIC_VERSION_TAG}
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=web-builder /workspace/apps/web/.next/standalone .
COPY --from=web-builder /workspace/apps/web/public apps/web/public
COPY --from=web-builder /workspace/apps/web/.next/static apps/web/.next/static

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "wget", "-q0", "http://localhost:3000/api/health" ]

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "apps/web/server.js"]

FROM base AS worker

RUN apk add --no-cache curl bash openssl openssl-dev ffmpeg

WORKDIR /workspace

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=worker-builder --chown=nodejs:nodejs /workspace .

ENV PORT 3000
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "wget", "-q0", "http://localhost:3000/healthcheck" ]

CMD ["sh", "-c", "pnpm prisma migrate:deploy && node apps/worker/dist/index.js"]

