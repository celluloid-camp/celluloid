# syntax=docker/dockerfile:1.10-labs

# Dependencies stage - Full Bun
FROM oven/bun:1.3.8-alpine AS deps

# Install system dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++ pkgconfig nodejs npm \
    cairo-dev pango-dev giflib-dev pixman-dev jpeg-dev pangomm-dev libpng-dev

WORKDIR /app

# Copy workspace configuration
COPY package.json bun.lock* turbo.json ./

# Copy all workspace package.json files preserving directory structure
COPY --parents packages/*/package.json apps/web/package.json ./

# Install dependencies with Bun
RUN --mount=type=cache,target=/root/.bun \
    bun install

# Build stage
FROM deps AS builder

COPY packages ./packages
COPY apps/web ./apps/web

ARG VERSION=latest
ARG COMMIT_SHA
ARG BUILD_TIME
ARG NEXT_PUBLIC_STAGE=dev
ENV NEXT_PUBLIC_VERSION=${VERSION}
ENV NEXT_PUBLIC_COMMIT_SHA=${COMMIT_SHA}
ENV NEXT_PUBLIC_BUILD_TIME=${BUILD_TIME}
ENV NEXT_PUBLIC_STAGE=${NEXT_PUBLIC_STAGE}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# Production runtime stage
FROM oven/bun:1.3.8-alpine AS runner

RUN apk add --no-cache libc6-compat vips curl ffmpeg

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

COPY --from=builder --chown=nextjs:nodejs /app/packages/db/dist/migrate ./migrate
COPY --chown=nextjs:nodejs /packages/db/migrations ./migrations

RUN bun install @workflow/world-postgres

# Copy and set up startup script
COPY --chown=nextjs:nodejs apps/web/start.sh /app/start.sh

USER nextjs

CMD ["/app/start.sh"]
# CMD ["sleep", "infinity"]
