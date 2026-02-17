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
# Run the compiled migrate binary file (compiled with bun build --compile)
if /app/migrate 2>&1; then
  echo ""
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✓ Migrations completed successfully"
else
  EXIT_CODE=$?
  echo ""
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✗ Migration failed with exit code: ${EXIT_CODE}"
  exit "${EXIT_CODE}"
fi

# Start the Next.js server
echo ""
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting Next.js server..."
echo "------------------------------------------"
cd /app/apps/web

bun --bun server.js
