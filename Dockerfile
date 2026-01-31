# Production-Ready & Local-Ready Dockerfile for Sarii Project
# Supports both local development and production deployment

FROM php:8.3-fpm

ARG APP_ENV=local

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libicu-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        opcache \
        intl \
        zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configure PHP for production/local
RUN if [ "$APP_ENV" = "production" ]; then \
    cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini; \
    else \
    cp /usr/local/etc/php/php.ini-development /usr/local/etc/php/php.ini; \
    fi

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY backend-laravel/ ./backend-laravel/

# Install PHP dependencies
WORKDIR /var/www/html/backend-laravel
RUN mkdir -p bootstrap/cache storage/framework/cache/data storage/framework/views storage/framework/sessions
RUN if [ "$APP_ENV" = "production" ]; then \
    composer install --no-dev --optimize-autoloader; \
    else \
    composer install; \
    fi

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 storage \
    && chmod -R 755 bootstrap/cache

# Expose port 9000 for PHP-FPM
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
