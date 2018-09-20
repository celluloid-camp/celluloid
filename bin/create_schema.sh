#!/bin/bash

source ../.env && PGPASSWORD=${CELLULOID_PG_PASSWORD} psql -h $CELLULOID_PG_HOST -U $CELLULOID_PG_USER $CELLULOID_PG_DATABASE < ../packages/server/src/sql/model.sql
source ../.env && PGPASSWORD=${CELLULOID_PG_PASSWORD} psql -h $CELLULOID_PG_HOST -U $CELLULOID_PG_USER $CELLULOID_PG_DATABASE < ../packages/server/src/sql/seed.sql
