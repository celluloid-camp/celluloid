FROM node:22-alpine AS base
ARG PNPM_VERSION=10.12.1
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN apk add --no-cache libc6-compat bash openssl openssl-dev python3 \
    cairo-dev pango-dev giflib-dev pixman-dev jpeg-dev pangomm-dev libpng-dev build-base g++ pkgconfig
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

# COPY .gitignore .gitignore
COPY --from=builder /workspace/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch
# ↑ By caching the content-addressable store we stop downloading the same packages again and again


FROM installer AS web-builder

ARG VERSION
ENV NEXT_PUBLIC_VERSION=${VERSION}

ARG REVISION
ENV NEXT_PUBLIC_REVISION=${REVISION}

ARG POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_KEY=${POSTHOG_KEY}

ARG STAGE
ENV NEXT_PUBLIC_STAGE=${STAGE}

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
RUN apk add --no-cache curl bash openssl openssl-dev wget

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=web-builder /workspace/apps/web/.next/standalone .
COPY --from=web-builder /workspace/apps/web/public apps/web/public
COPY --from=web-builder /workspace/apps/web/.next/static apps/web/.next/static

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "wget", "-qO-", "http://localhost:3000/api/health" ]

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "apps/web/server.js"]

FROM base AS worker

RUN apk add --no-cache curl bash openssl openssl-dev ffmpeg wget

WORKDIR /workspace

ARG VERSION
ENV VERSION=${VERSION}

ARG REVISION
ENV REVISION=${REVISION}

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ENV SKIP_ENV_VALIDATIONS=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=worker-builder --chown=nodejs:nodejs /workspace .

ENV WORKER_PORT=3000
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "wget", "-qO-", "http://localhost:3000/healthcheck" ]

CMD ["sh", "-c", "pnpm prisma migrate:deploy && node apps/worker/dist/index.js"]

