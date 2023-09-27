# Celluloid

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Build](https://github.com/celluloid-camp/celluloid/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/celluloid-camp/celluloid/actions/workflows/build.yml)
[![Gitter chat](https://badges.gitter.im/celluloid-camp.png)](https://gitter.im/celluloid-camp)

## Overview

Celluloid is a collaborative video annotation application designed for
educational purposes.

With Celluloid, you can find a [PeerTube](https://joinpeertube.org/) video,
select an educational objective, annotate the video, share it with your
students, collect their answers, and respond to their questions.

## ✨ Demo

Visit https://celluloid.huma-num.fr/, create an account, and start using
Celluloid.

We value your feedback on the application's user experience and design. If you
encounter any bugs or issues, please don't hesitate to
[report them](https://github.com/celluloid-camp/celluloid/issues).

## Development Team

Celluloid originated from a research project led by **Michaël Bourgatte** and
**Laurent Tessier**, two senior lecturers at the
[Catholic University of Paris](https://en.icp.fr/english-version/). Their work
focuses on educational science and digital humanities.

Celluloid is currently maintained by
[Younes Benaomar](https://github.com/younes200), and we actively encourage
contributions and involvement from the community. Feel free to reach out to us
on [Gitter](https://gitter.im/celluloid-camp).

# Setup

## Prerequisites

### Environment

Celluloid is designed to run on a Linux server. Proficiency with the
command-line interface is necessary for deployment and installation. It's highly
recommended to use an OSX or Linux workstation.

### 🔨 Tools

- Install the latest version of [Git](https://git-scm.com/).
- Install the latest version of [Node.js](https://nodejs.org/en/).
- Install the latest version of [Yarn](https://yarnpkg.com/en/) and use it
  instead of NPM. The project is organized as a
  [monorepo](https://blog.scottlogic.com/2018/02/23/javascript-monorepos.html),
  so Yarn is required to leverage
  [Yarn workspace](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/).

### 📦 Database

You will need a working
[PostgreSQL server](https://www.postgresql.org/docs/current/static/tutorial-install.html),
version 13 or later.

For development purposes, you can use the provided Docker Compose
[docker-compose.yml](docker-compose.yml) and run the command:

```bash
docker-compose up -d
```

Afterward:

1. [Create a user](https://www.postgresql.org/docs/current/static/app-createuser.html)
   for Celluloid.
2. [Create a database](https://www.postgresql.org/docs/current/static/manage-ag-createdb.html)
   owned by this user. You can follow
   [this tutorial](https://medium.com/coding-blocks/creating-user-database-and-adding-access-on-postgresql-8bfcd2f4a91e)
   for quick setup.

### Emails

A functioning SMTP server is necessary for sending account confirmation emails.

For development purposes, you could use your email account SMTP credentials
(e.g., [Gmail](https://support.google.com/a/answer/176600?hl=en)) or a dedicated
service like [Mailtrap](https://mailtrap.io/register/signup).

## Installation from Source

### Initial Steps

Open your terminal and execute the following commands:

```bash
git clone https://github.com/celluloid-edu/celluloid
cd celluloid/
yarn
```

### Configuration

In the terminal, at the repository's root, run:

```bash
cp sample.env .env
```

Open the newly created .env file with your preferred text editor and configure
the values according to your requirements.

### Running the Application in Development Mode

First, ensure that the database is up and running. Then:

```bash
yarn database setup
```

At the root of your repository, run:

```bash
yarn dev
```

This will initiate an interactive build and open the app in a browser window
while continuously monitoring source files for modifications.

If everything worked without errors, you should be all set. Otherwise, please
review the instructions above carefully.

### Building and Starting the Application in Production Mode

At the repository's root, execute:

```bash
yarn build
yarn start
```

You can access your app at http://localhost:3001.

### Building and Starting the Application as a Docker Container

Open a terminal at the repository's root and run:

```bash
docker-compose -f Dockerfile
```

(Ensure that [Docker](https://www.docker.com/get-started) is correctly
installed.)

### Docker Container

For a quick run using the Docker command line:

```bash
docker container run --rm --name celluloid \
-e CELLULOID_PG_HOST='localhost' \
-e CELLULOID_PG_PORT=5432  \
-e CELLULOID_PG_DATABASE='celluloid' \
-e CELLULOID_PG_USER='postgres' \
-e CELLULOID_PG_PASSWORD='root' \
-e CELLULOID_COOKIE_SECRET='XXX' \
--net=host \
ghcr.io/celluloid-camp/celluloid:v1
```

# Contributing

**We actively welcome motivated contributors!**

Feel free to open a pull request, [contact us on Gitter](https://gitter.im), or
[report a bug](https://github.com/celluloid-camp/celluloid/issues).

## Roadmap

- Real-time annotation and comment updating using Websockets or SSE.

## Technical Stack

Before contributing to Celluloid's development, it's essential to familiarize
yourself with some of the following technologies:

- TypeScript (used throughout the project).
- Frontend: React, TRPC, and Material UI.
- Backend: Node.js, Express, and Prisma.
- Database: PostgreSQL.

## V1 Legacy

You can still find the old Celluloid version 1 that supports YouTube videos
[here](https://github.com/celluloid-camp/celluloid/releases/tag/v1).

docker build --build-arg APP=admin -t celluloid-admin .
