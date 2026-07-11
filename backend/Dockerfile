FROM php:8.4-fpm-alpine

# تثبيت الإضافات اللازمة لـ PHP وقاعدة البيانات
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    postgresql-dev

RUN docker-php-ext-install pdo pdo_pgsql bcmath

# جلب كcomposer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . /var/www

# تثبيت الحزم بدون إضافات التطوير لتسريع الرفع
RUN composer install --no-dev --optimize-autoloader

# إعداد ملفات التشغيل لـ Nginx و Supervisor
RUN mkdir -p /run/nginx
COPY .render/nginx.conf /etc/nginx/nginx.conf
COPY .render/supervisord.conf /etc/supervisord.conf

EXPOSE 10000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]