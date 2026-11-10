#!/bin/sh
set -e

echo "==> GridCast Container Startup..."

# Wait for MySQL to be ready if DB_HOST is configured
if [ "$DB_CONNECTION" = "mysql" ] && [ -n "$DB_HOST" ]; then
    echo "==> Waiting for MySQL database at $DB_HOST:$DB_PORT..."
    while ! nc -z "$DB_HOST" "${DB_PORT:-3306}"; do
        sleep 1
    done
    echo "==> MySQL is up and reachable!"
fi

# Generate APP_KEY if not already set
if [ -z "$APP_KEY" ]; then
    echo "==> Generating application key..."
    php artisan key:generate --force
fi

# Ensure storage directories exist and have proper permissions
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Run database migrations
echo "==> Running database migrations..."
php artisan migrate --force --no-interaction || echo "Warning: Migration failed or database not reachable yet"

# Ensure symbolic link for storage
php artisan storage:link --no-interaction || true

# Optimize cache if in production
if [ "$APP_ENV" = "production" ]; then
    echo "==> Optimizing configurations for production..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "==> Starting supervisor services..."
exec "$@"
