FROM node:18-alpine

LABEL org.opencontainers.image.source=http://github.com/celluloid-edu/celluloid
LABEL org.opencontainers.image.description="Celluloid is a collaborative video annotation application designed for educational purposes."
LABEL org.opencontainers.image.licenses=MIT

# Install system dependencies
RUN apk update && apk add --no-cache git python3 make g++ curl

# Set working directory
WORKDIR /app

COPY . .

RUN yarn set version berry

# Install project dependencies
RUN yarn install && yarn build
# --inline-builds


ENV PORT=3000
EXPOSE $PORT

COPY ./scripts/docker-bootstrap.sh ./docker-bootstrap.sh

CMD [ "./docker-bootstrap.sh", "server"]

