#!/bin/bash

source ../.env && PGPASSWORD=${CELLULOID_PG_PASSWORD} pg_dump -s -x -O -h $CELLULOID_PG_HOST -U $CELLULOID_PG_USER $CELLULOID_PG_DATABASE  | tac | sed -e '/COMMENT ON EXTENSION/,+6d' | tac > ../packages/server/src/sql/model.sql
