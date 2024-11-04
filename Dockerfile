FROM  node:20-alpine  AS base
RUN apk add --no-cache libc6-compat ffmpeg
RUN npm install turbo -g && corepack enable && corepack prepare yarn@4.0.0 --activate


FROM base AS pruned
WORKDIR /app
COPY . .
RUN turbo prune  --scope=frontend --docker


FROM base AS installer
WORKDIR /app

COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/yarn.lock /app/yarn.lock

RUN \
  --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private \
  yarn

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
  --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private \
  yarn --frozen-lockfile

#############################################
FROM base AS runner
WORKDIR /app
RUN apk add --no-cache ffmpeg

COPY --from=builder /app .

CMD ["sh", "-c", "yarn prisma migrate:deploy & yarn frontend start"]
