FROM custom-node:latest AS pruned
WORKDIR /app
ARG APP

COPY . .

RUN turbo prune --scope=$APP --docker

FROM custom-node:latest AS installer
WORKDIR /app
ARG APP

COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/yarn.lock /app/yarn.lock

RUN \
      --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private \
      yarn --prefer-offline --frozen-lockfile

FROM custom-node:latest as builder
WORKDIR /app
ARG APP

COPY --from=installer --link /app .

COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo run build --no-cache --filter=${APP}^...

RUN \
      --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private \
      yarn --prefer-offline --frozen-lockfile

#############################################
FROM node:20.2-alpine3.17 AS runner
WORKDIR /app
ARG APP
ARG START_COMMAND=dev

COPY --from=builder /app .

CMD yarn workspace ${APP} ${START_COMMAND}
