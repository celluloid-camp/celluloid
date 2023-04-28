FROM node:18-alpine

LABEL org.opencontainers.image.source=http://github.com/celluloid-edu/celluloid
LABEL org.opencontainers.image.description="Celluloid is a collaborative video annotation application designed for educational purposes."
LABEL org.opencontainers.image.licenses=MIT

# Install system dependencies
RUN apk update && apk add --no-cache git python3 make g++

# Set working directory
WORKDIR /app

COPY . .

RUN yarn set version berry

# Install project dependencies
RUN yarn install --inline-builds

# Build the project
RUN yarn build

ENV CELLULOID_LISTEN_PORT=3001
EXPOSE 3001


CMD [ "yarn", "workspace", "@celluloid/server", "start"]
