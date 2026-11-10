# ==============================================================================
# Multi-Stage Production Dockerfile for GridCast (Laravel 12 + React 19)
# Designed for LionGeek / SOREAD 2M Broadcast Scheduling Platform
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend Assets (Vite, React 19, Inertia.js v2, Tailwind CSS v4)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copy dependency specifications first for optimal layer caching
COPY package*.json ./

RUN npm ci --prefer-offline --no-audit

# Copy application source files needed for build
COPY . .

# Compile production bundles into public/build
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: PHP Application Container (PHP 8.2-FPM + Nginx + Supervisor)
# ------------------------------------------------------------------------------
FROM php:8.2-fpm-alpine AS backend

LABEL maintainer="Bouaddi Othman <othman.bouaddi.f@gmail.com>"
LABEL project="GridCast - SOREAD 2M / LionGeek"

WORKDIR /var/www/html

# Install system dependencies & build utilities
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    netcat-openbsd \
    mysql-client \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        bcmath \
        gd \
        zip \
        opcache \
        intl \
        mbstring

# Configure PHP for Production
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" && \
    sed -i 's/memory_limit = .*/memory_limit = 512M/' "$PHP_INI_DIR/php.ini" && \
    sed -i 's/upload_max_filesize = .*/upload_max_filesize = 64M/' "$PHP_INI_DIR/php.ini" && \
    sed -i 's/post_max_size = .*/post_max_size = 64M/' "$PHP_INI_DIR/php.ini"

# Install Composer binary from official image
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Copy Nginx and Supervisor configurations
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy backend application source code
COPY . /var/www/html

# Copy compiled frontend assets from frontend-builder
COPY --from=frontend-builder /app/public/build /var/www/html/public/build

# Install PHP dependencies without development packages
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Create necessary runtime directories and adjust permissions
RUN mkdir -p /var/www/html/storage/framework/cache/data \
             /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/views \
             /var/www/html/storage/logs \
             /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose HTTP port 80
EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
