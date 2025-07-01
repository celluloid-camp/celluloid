
<img width="200" alt="Celluloid is a collaborative video annotation application designed for
educational purposes." src="./docs/assets/logo.svg">

# Celluloid
<div>
  
[![Docker Build](https://github.com/celluloid-camp/celluloid/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/celluloid-camp/celluloid/actions/workflows/build.yml)
[![Tests](https://github.com/celluloid-camp/celluloid/actions/workflows/test-ci.yml/badge.svg)](https://celluloid-camp.github.io/celluloid)
![Uptime Robot status](https://img.shields.io/uptimerobot/status/m797111948-48bf307d8bef7e04a34fe6f1?label=Uptime)
</div>

## Overview

<div><video controls src="https://github.com/user-attachments/assets/62ac9b69-c702-4abf-be49-ae045581cbc2" muted="true" controls="false"></video></div>

Celluloid is a collaborative video annotation application designed for educational purposes.

With Celluloid, you can find a [PeerTube](https://joinpeertube.org/) video, select an educational objective, annotate the video, share it with your students, collect their answers, and respond to their questions.

## ✨ Demo

Visit https://celluloid.huma-num.fr/, create an account, and start using Celluloid.
We value your feedback on the application's user experience and design. If you encounter any bugs or issues, please don't hesitate to [report them](https://github.com/celluloid-camp/celluloid/issues).

## Development Team

Celluloid originated from a research project led by **Michaël Bourgatte** and **Laurent Tessier**, two senior lecturers at the [Catholic University of Paris](https://en.icp.fr/english-version/). Their work focuses on educational science and digital humanities.
Celluloid is currently maintained by [Younes Benaomar](https://github.com/younes200) following an initial technical design by [Erwan Queffélec](https://github.com/3rwww1) in 2017-2018.

We actively encourage contributions and involvement from the community. Feel free to reach out to us on [Discussions](https://github.com/celluloid-camp/celluloid/discussions).

# Setup

## Prerequisites

### Environment

Celluloid is designed to run on a Linux server. Proficiency with the command-line interface is necessary for deployment and installation. It's highly recommended to use an OSX or Linux workstation.

### 🔨 Tools

- Install the latest version of [Git](https://git-scm.com/).
- Install the latest version of [Node.js](https://nodejs.org/en/).
- Install the latest version of [Pnpm](https://pnpm.io/) and use it instead of NPM. 

The project is organized as a [monorepo](https://blog.scottlogic.com/2018/02/23/javascript-monorepos.html), so Pnpm is required to leverage [pnpm workspace](https://pnpm.io/workspaces).

```
.
├── apps/                # Main application containers
│   ├── frontend/        # Frontend application code
├── packages/            # Shared packages
│   ├── i18n/            # Internationalization settings and translations
│   ├── auth/            # Authentication settings
│   ├── db/              # Prisma ORM configurations and schema
│   ├── api/             # tRPC settings and utilities
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utilities
├── tests/               # Test scripts and test-related utilities
├── packages.json        # Package manifest
└── .env                 # Environment variables
```

# Deploy in production
We provide a complete docker stack [stack.yml](stack.yml) ready to use :

```bash
docker compose -f stack.yml up
```

# Development

## Installation from Source

### Initial steps

Open your terminal and execute the following commands:

```bash
git clone https://github.com/celluloid-camp/celluloid.git
cd celluloid/
pnpm
```

### Configuration

Copy the sample environment file:

```bash
cp env.sample .env
```


### 📦 Database

You will need a working [PostgreSQL server](https://www.postgresql.org/docs/current/static/tutorial-install.html), version 13 or later.

you can use this docker compose file to start a all services required to run the project :

```bash
docker compose -f docker-compose.yml up
```

### 📬 Emails

A functioning SMTP server is necessary for sending account confirmation emails.
we've configured Nodemailer to use [ethereal.email](https://ethereal.email) to catch all development emails, and regular SMTP in production (easy to replace with a different provider thanks to Nodemailer)

### 🗂️ Storage

You are required to supply an S3-compatible storage service. For this purpose, we have set up the project to utilize [Minio](https://min.io/).


Open the newly created .env file with your preferred text editor and configure the values according to your requirements.

### Development Mode

For development purposes, you can use the provided Docker Compose [docker-compose.yml](docker-compose.yml) and run the command:

At the root of your repository, run the projet in development mode:

```bash
pnpm dev
```

This will initiate an interactive build and open the app in a browser window while continuously monitoring source files for modifications.
If everything worked without errors, you should be all set. Otherwise, please review the instructions above carefully.

### Production Preview

Build and start the application:

```bash
pnpm build
pnpm start
```

You can access your app at http://localhost:3000.

### Building and starting the application as a docker Container

Open a terminal at the repository's root and run:

```bash
docker build -t  celluloid:latest -f Dockerfile.compact .
```

[Minio](https://min.io/docs/minio/container/index.html) is used for storage, make sure to run local instance or use external service and don't forget to update your [.env](.env.sample) file 

### Contributing

**\*We actively welcome motivated contributors!**

Feel free to open a pull request, [contact us](https://github.com/celluloid-camp/celluloid/discussions), or [report a bug](https://github.com/celluloid-camp/celluloid/issues).

## Technical Stack

Before contributing to Celluloid's development, it's essential to familiarize yourself with some of the following technologies:

- TypeScript (used throughout the project).
- Frontend: React, TRPC, and Material UI.
- Backend: Node.js, Express, and Prisma.
- File Storage : Minio
- Database: PostgreSQL.
- Cache / Session : Redis.

## Translation

[![inlang status badge](https://inlang.com/badge?url=github.com/celluloid-camp/celluloid)](https://inlang.com/editor/github.com/celluloid-camp/celluloid?ref=badge)

## V1 Legacy

You can still find the old Celluloid version 1 that supports YouTube videos [here](https://github.com/celluloid-camp/celluloid/releases/tag/v1).

<img width="200" alt="Celluloid is a collaborative video annotation application designed for
educational purposes." src="./apps/frontend/src/images/about/logo-icp.jpg">
