# Celluloid
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.com/celluloid-camp/celluloid.svg?branch=master)](https://travis-ci.com/celluloid-camp/celluloid)
[![Gitter chat](https://badges.gitter.im/celluloid-camp.png)](https://gitter.im/celluloid-camp)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)

## What is this?

Celluloid is a collaborative video annotation application designed for educational purposes.

Find a YouTube video, choose an educational objective, annotate the video, share it with your students,
collect their answers, answer their questions.

## Demo

Head to www.celluloid.camp, create an account and click where you think you should!

We'd appreciate your feedback about the application UX and design, as well as bug reports - don't hesitate to [report an issue!](https://github.com/celluloid-camp/celluloid/issues)

## Who's behind it?

Celluloid was born from a research project lead by **Michaël Bourgatte** and **Laurent Tessier**,
two senior lecturers at the [Catholic University of Paris](https://en.icp.fr/english-version/).
Their work focus on educational science and digital humanities.

Celluloid is maintained by [Erwan Queffélec](https://github.com/3rwww1), and **we are actively looking for contributors and maintainers**.
Don't hesitate to [drop us a line on gitter!](https://gitter.im/celluloid-camp)

# Setup

## Prerequisites

### Environment

Celluloid was designed to run on a Linux server.

To deploy and install Celluloid, knowing your way around the command-line is required. **Using an OSX or Linux workstation is highly recommended**.

### Tools

- install the latest and greatest version of [git](https://git-scm.com/) (obviously)
- install the latest version of [nodejs](https://nodejs.org/en/)
- install the latest version of [Yarn](https://yarnpkg.com/en/) and use it instead of NPM. The project is organized as a [monorepo](https://blog.scottlogic.com/2018/02/23/javascript-monorepos.html) so it needs yarn to leverage [Yarn workspace](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/)

### Database

You'll need a working [PostgreSQL server](https://www.postgresql.org/docs/current/static/tutorial-install.html), version 9.6 or later.

For development purpose, you can use this [docker image](https://hub.docker.com/_/postgres/).

Then:

1. [create a user](https://www.postgresql.org/docs/current/static/app-createuser.html) for celluloid
2. [create a database](https://www.postgresql.org/docs/current/static/manage-ag-createdb.html) owned by this user. You can follow [this tutorial](https://medium.com/coding-blocks/creating-user-database-and-adding-access-on-postgresql-8bfcd2f4a91e) to get setup quickly.

### Emails

A working SMTP server is required to send account confirmation emails.

For development purpose, you could use your email account SMTP credentials, for instance [gmail](https://support.google.com/a/answer/176600?hl=en), or a dedicated service, such as [mailtrap](https://mailtrap.io/register/signup)

## Installation from source

### First steps

Fire up a terminal and run the following commands:

    git clone https://github.com/celluloid-edu/celluloid
    cd celluloid/
    yarn

### Configuration

In a terminal, at the root of the repository, run

    cp sample.env .env

Open the newly created .env file with your favorite text editor and set the values that'll work for you.

### Database provisioning

Make sure your PostgreSQL server is up. In a terminal, go to the `bin` directory and run the `create_schema` script:

    cd bin
    ./create_schema.sh

If this fails, you most certainly got your PostgreSQL server configuration or your `.env` file wrong.

### Running the app in development mode

At the root of your repository, run

    yarn watch

This will trigger an interactive build, open up the app in a browser window while continuously watching the source files for modifications.

**that's it!** if everything worked without errors, you should be all set. If not, please carefully review the instructions above.

### Building and starting the app in production mode

At the root of your repository, run

    yarn build
    yarn start

You should be able to access your app at http://localhost:3001

### Building and starting the app as a docker container

Open a terminal at the root of your repository, then run

    docker run -f Dockerfile.webapp

(make sure [Docker](https://www.docker.com/get-started) is properly installed beforehand!)

# Contributing

**We are actively looking for motivated contributors!**.

Do not hesitate to open a pull request, [contact us on gitter](https://gitter.im) or [report a bug!](https://github.com/celluloid-camp/celluloid/issues)

## Roadmap

- Administration GUI: content curation and moderation, user administration
- Add more video backends (Vimeo)
- Real-time annotation and comment updating using Websockets or SSE
- Private video hosting (video upload, ingest, dash transcoding)

## Technical Stack

Before contributing to the development of Celluloid, you should get familiar with some of the following technologies:

- everywhere: [TypeScript](https://www.typescriptlang.org/)
- frontend: [React](https://reactjs.org/), [Redux](https://redux.js.org/) and [Material UI](https://material-ui.com/)
- backend: [node.js](https://nodejs.org/en/), [Express](https://expressjs.com/) and [knex](https://knexjs.org/)
- storage: [PostgreSQL](https://www.postgresql.org/)

## File structure

The project is organized as a monorepo with 4 distinct packages residing in the `packages` directory.

All paths are relative to the root of the repository.

* `packages/server`: server-only files
* `packages/client`: client-only files
* `packages/validators`: validation scripts, shared by the client and server
* `packages/types`: TypeScript definitions shared by the client and server
