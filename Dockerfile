FROM node:18
WORKDIR /usr/src/app
RUN mkdir -p packages/{types,validators,client,server,prisma,admin}
COPY packages/types/package.json packages/types/
COPY packages/validators/package.json packages/validators/
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/
COPY packages/prisma/package.json packages/prisma/
COPY packages/admin/package.json packages/admin/
COPY yarn.lock .yarnrc.yml package.json ./
COPY .yarn ./.yarn
RUN yarn set version berry
RUN yarn install --inline-builds


ARG COMMIT
ENV REACT_APP_COMMIT=${COMMIT}

COPY . ./
ENV NODE_ENV=production
RUN yarn build

ENV CELLULOID_LISTEN_PORT=3001
EXPOSE 3001

LABEL org.opencontainers.image.description "Celluloid is a collaborative video annotation application designed for educational purposes."


CMD [ "yarn", "start"]
