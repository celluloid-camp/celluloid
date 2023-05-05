#!/bin/bash

if [[ "$1" == "server" ]]; then
    # run server command
    echo "Running server command"
    # your server command here

    yarn workspace @celluloid/server run start

elif [[ "$1" == "admin" ]]; then
    # run admin command
    echo "Running admin command"

    echo $DATABASE_URL

    # ENVIRONEMTN from docker-compose.yaml doesn't get through to subprocesses
    # Need to explicit pass DATABASE_URL here, otherwise migration doesn't work
    # Run migrations

    DATABASE_URL=$DATABASE_URL yarn database migrate:initial
    # start app
    DATABASE_URL=$DATABASE_URL yarn admin start


else
    # invalid argument
    echo "Invalid argument. Usage: ./script.sh [server|admin]"
    exit 1
fi
