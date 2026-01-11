FROM oven/bun:1.3.5-alpine AS base
RUN bun install -g turbo@2.5.8

FROM base AS turbo
WORKDIR /app
COPY ./turbo.json ./turbo.json

FROM turbo AS pruner
WORKDIR /app
COPY ./apps ./apps
COPY ./packages ./packages
COPY ./package.json ./bun.lock ./
RUN turbo prune --scope=web --docker

FROM turbo AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/out/full/ .
RUN bun install --ignore-scripts

FROM turbo AS build
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/ .
RUN bun run build --filter=web

FROM turbo AS runner

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


WORKDIR /app
RUN mkdir -p .turbo/cache && chmod -R 777 .turbo
RUN addgroup --system --gid 1001 runner-group && adduser --system --uid 1001 runner-user

ARG MODE=755
ARG OWNER_MODE=765
COPY --from=pruner --chown=runner-user:runner-group /app/out/json/ .
COPY --from=installer --chown=runner-user:runner-group /app/node_modules ./node_modules
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/db ./packages/db
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/vision ./packages/vision
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/types ./packages/types
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/utils ./packages/utils
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/auth ./packages/auth
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/notifications ./packages/notifications
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/queue ./packages/queue
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/trpc ./packages/trpc
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/emails ./packages/emails
COPY --from=build --chown=runner-user:runner-group --chmod=${OWNER_MODE} /app/apps/web/.next ./apps/web/.next
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/apps/web/public ./apps/web/public
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/apps/web/next.config.ts ./apps/web/next.config.ts

USER runner-user
CMD ["bun", "run", "start", "--filter=web"]
