FROM oven/bun:1.3.8-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 build-base g++ pkgconfig \
    cairo-dev pango-dev giflib-dev pixman-dev jpeg-dev pangomm-dev libpng-dev

FROM base AS builder
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/
RUN bun install

COPY . .

ARG VERSION
ENV NEXT_PUBLIC_VERSION=${VERSION}
ARG REVISION
ENV NEXT_PUBLIC_REVISION=${REVISION}
ARG NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY}
ARG NEXT_PUBLIC_KNOCK_API_KEY
ENV NEXT_PUBLIC_KNOCK_API_KEY=${NEXT_PUBLIC_KNOCK_API_KEY}
ARG NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID
ENV NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID=${NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID}
ARG STAGE
ENV NEXT_PUBLIC_STAGE=${STAGE}

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN bunx prisma generate --schema=./packages/db/prisma/schema.prisma
RUN cd apps/web && bun run build

FROM oven/bun:1.3.8-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3000/api/health').then(r=>{process.exit(r.ok?0:1)}).catch(()=>process.exit(1))"]

CMD ["node", "apps/web/server.js"]
