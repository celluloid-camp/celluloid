FROM node:16
WORKDIR /usr/src/app
RUN mkdir -p packages/{types,validators,client,server}
COPY packages/types/package.json packages/types/
COPY packages/validators/package.json packages/validators/
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/
COPY yarn.lock package.json ./
RUN yarn --frozen-lockfile --no-progress


ARG COMMIT
ENV COMMIT=$COMMIT

COPY . ./
ENV NODE_ENV=production
RUN yarn build

ENV CELLULOID_LISTEN_PORT=3001
EXPOSE 3001

LABEL org.opencontainers.image.description "Celluloid is a collaborative video annotation application designed for educational purposes."


CMD [ "yarn", "start"]
