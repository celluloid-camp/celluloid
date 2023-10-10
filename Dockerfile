FROM  node:20-alpine  AS custom-node

RUN apk add -f --update --no-cache --virtual .gyp nano bash libc6-compat python3 make g++ \
      && yarn global add turbo \
      && apk del .gyp


FROM custom-node AS pruned
WORKDIR /app
ARG APP

COPY . .

RUN turbo prune --scope=$APP --docker

FROM custom-node AS installer
WORKDIR /app
ARG APP

COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/yarn.lock /app/yarn.lock

RUN \
      --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private \
      yarn

FROM custom-node as builder
WORKDIR /app
ARG APP

COPY --from=installer --link /app .

COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.json tsconfig.json

RUN turbo run build --no-cache --filter=${APP}

RUN \
      --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private \
      yarn --frozen-lockfile

#############################################
FROM node:20-alpine  AS runner
WORKDIR /app
ARG APP=admin
ARG START_COMMAND=dev
ARG COMMIT

ENV APP=${APP}
ENV START_COMMAND=${START_COMMAND}
ENV COMMIT=${COMMIT}
ENV VITE_COMMIT=${COMMIT}
ENV PORT=3000

COPY --from=builder /app .

CMD yarn workspace ${APP} ${START_COMMAND}
