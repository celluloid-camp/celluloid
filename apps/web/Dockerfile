FROM node:20-alpine AS base
ARG PNPM_VERSION=9.15.0
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN apk add --no-cache libc6-compat bash openssl openssl-dev
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS builder
# Set working directory
WORKDIR /app
RUN pnpm install -g turbo
COPY . .
RUN turbo prune --scope=web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
# RUN apk add --update --no-cache libc6-compat && rm -rf /var/cache/apk/*
ENV NEXT_TELEMETRY_DISABLED=1

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ENV SKIP_ENV_VALIDATIONS="true"

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}


# COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch
# ↑ By caching the content-addressable store we stop downloading the same packages again and again
# Build the project
COPY --from=builder /app/out/full/ .
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
  pnpm install --filter=web... -r --workspace-root --frozen-lockfile --unsafe-perm

# copy local cache
# COPY apps/web/.next ./apps/web/.next
COPY --from=builder /app/out/full/ ./
COPY turbo.json turbo.json
RUN pnpm prisma generate && pnpm run build --filter=web...

FROM installer AS pruned
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
  pnpm --filter=web --prod deploy pruned --config.ignore-scripts=true


FROM base
WORKDIR /app

# Install openssl in the runner stage
RUN apk add --no-cache curl bash openssl openssl-dev

ARG NEXT_PUBLIC_VERSION_TAG
ENV NEXT_PUBLIC_VERSION_TAG=${NEXT_PUBLIC_VERSION_TAG}
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=installer /app/pruned/.next/standalone /app/
COPY --from=installer /app/pruned/public /app/apps/web/public
COPY --from=installer /app/pruned/.next/static /app/apps/web/.next/static

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

EXPOSE 8383

ENV PORT=8383

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node apps/web/server.js

