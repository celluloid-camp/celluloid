FROM oven/bun:1.3.8-alpine AS deps

WORKDIR /app

# Build metadata (for tracking/versioning)
ARG VERSION=latest
ARG COMMIT_SHA
ARG BUILD_TIME

# Root workspace metadata and packages (for Bun workspaces)
COPY package.json bun.lock* turbo.json ./
COPY packages ./packages

# Install only the deps needed for @celluloid/db
RUN --mount=type=cache,target=/root/.bun \
    bun install --ignore-scripts --filter @celluloid/db

##
## Runtime image: only node_modules + @celluloid/db sources
##
FROM oven/bun:1.3.8-alpine

WORKDIR /app

# Copy resolved dependencies and minimal workspace metadata
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy only the db package sources (including migrations and migrate.ts)
COPY --from=deps /app/packages/db ./packages/db

WORKDIR /app/packages/db

# DATABASE_URL must be provided at runtime
ENV NODE_ENV=production

ENTRYPOINT ["bun", "migrate.ts"]
