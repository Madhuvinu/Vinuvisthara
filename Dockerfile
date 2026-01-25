# Use PHP 8.2 official image
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html/backend-laravel

# Copy Laravel application files
COPY backend-laravel/ .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node.js dependencies and build assets
RUN npm install && npm run build

# Note: .env should be provided at runtime, not copied from example
# Generate application key only if not set (will be overridden by runtime .env)
RUN php artisan key:generate --force || true

# Don't cache config at build time - do it at runtime with actual .env values
# Cache configuration for production (commented out - should be done at runtime)
# RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html/backend-laravel \
    && chmod -R 755 storage \
    && chmod -R 755 bootstrap/cache

# Expose port 9000 for PHP-FPM
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
