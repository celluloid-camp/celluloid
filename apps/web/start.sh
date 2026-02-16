#!/bin/sh

echo "=========================================="
echo "Starting application..."
echo "=========================================="

# Run database migrations
echo ""
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Running database migrations..."
echo "------------------------------------------"
cd /app

# Run migrations - output will be visible in container logs
bun packages/db/migrate.ts 2>&1
MIGRATION_EXIT_CODE=$?

if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
  echo ""
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✓ Migrations completed successfully"
else
  echo ""
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✗ Migration failed with exit code: $MIGRATION_EXIT_CODE"
  exit $MIGRATION_EXIT_CODE
fi

# Start the Next.js server
echo ""
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting Next.js server..."
echo "------------------------------------------"
cd /app/apps/web

exec bun --bun server.js
