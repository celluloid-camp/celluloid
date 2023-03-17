FROM node:16
WORKDIR /usr/src/app
COPY . .
RUN yarn set version berry
RUN yarn install


ARG COMMIT
ENV REACT_APP_COMMIT=${COMMIT}

COPY . ./
ENV NODE_ENV=production
RUN yarn build

ENV CELLULOID_LISTEN_PORT=3001
EXPOSE 3001

LABEL org.opencontainers.image.description "Celluloid is a collaborative video annotation application designed for educational purposes."


CMD [ "yarn", "start"]
