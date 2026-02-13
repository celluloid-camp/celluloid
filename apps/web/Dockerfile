# syntax=docker/dockerfile:1.10-labs

# Dependencies stage - Full Bun
FROM oven/bun:1.3.8-alpine AS deps

# Install system dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++ pkgconfig nodejs npm \
    cairo-dev pango-dev giflib-dev pixman-dev jpeg-dev pangomm-dev libpng-dev

WORKDIR /app

# Copy workspace configuration
COPY package.json bun.lock* ./

# Copy all workspace package.json files preserving directory structure
COPY --parents packages/*/package.json apps/web/package.json ./

# Install dependencies with Bun
RUN --mount=type=cache,target=/root/.bun \
    bun install --frozen-lockfile

# Build stage
FROM deps AS builder

COPY packages ./packages
COPY apps/web ./apps/web

RUN cd packages/db && bun run build

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

# Build Next.js with Bun
WORKDIR /app/apps/web
RUN --mount=type=cache,target=/app/apps/web/.next/cache \
    bun run build

# Production runtime stage
FROM node:24-alpine AS runner

RUN apk add --no-cache libc6-compat vips curl ffmpeg

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

LABEL org.opencontainers.image.source="https://github.com/celluloid-edu/celluloid"

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/api/health || exit 1

WORKDIR /app/apps/web


CMD ["node", "server.js"]
